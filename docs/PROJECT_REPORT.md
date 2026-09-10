# MediCare AI — Project Report

**Tahmid Nafees** · [github.com/tahmidnafees619](https://github.com/tahmidnafees619)

A privacy-first symptom analysis system: a 776-class ML ensemble, retrieval-based
symptom validation, and a local LLM, wired into a React application that runs
entirely on your own machine with no cloud API calls.

---

## What it does

A user describes how they feel in plain English. The system extracts symptoms,
asks targeted yes/no follow-ups, ranks candidate conditions, and explains the
shortlist in language a non-clinician can follow — then tells the user, plainly,
how much to trust it.

**Stack:** React 19 · TypeScript · Vite · Tailwind · Express · Prisma/SQLite ·
Flask · scikit-learn · Ollama (llama3.2)

---

## Architecture

```
React (5173) ──► Express API (5000) ──┬──► Flask ML service (8000)
                                      │      RF + SVM + Naive Bayes ensemble
                                      │      TF-IDF over 776 disease classes
                                      │
                                      ├──► RAG validation
                                      │      773-entry medical knowledge base
                                      │
                                      └──► Ollama llama3.2 (11434)
                                             extraction · follow-ups · explanation
```

Three independent services, each degrading gracefully: if the ML service is
down the API falls back to LLM reasoning; if the LLM times out it falls back to
a templated explanation. No stage can take the request down with it.

---

## The engineering problem worth talking about

The interesting work here was not building the pipeline. It was **measuring it
and discovering the headline number was meaningless.**

### 1. A confidence threshold that rejected every correct answer

The ensemble classifies across **776 disease classes**, where random chance is
0.13%. A *correct* top-1 prediction carries a raw probability of only **3–6%** —
that is 25–45× better than chance, but the pipeline compared it against a
`confidence >= 30` gate designed for a handful of classes.

The result: correct predictions were discarded on every single request, and the
app returned `"Unknown Condition"` at 20% confidence 100% of the time. The model
was working. The gate was measuring the wrong thing.

**Fix:** the ML service now reports a **calibrated confidence** from two signals —
*lift* (how far above the 1/776 baseline the top pick sits, log-scaled so a
perfect classifier maps to 100) and *dominance* (share of the top-5 probability
mass). On this scale nonsense input lands near **23** and real symptom sets near
**40–55**, giving a threshold that actually separates signal from noise.

### 2. Measuring the model instead of trusting it

I built a fixed battery of textbook presentations and benchmarked it:

| Metric | Result |
|---|---|
| **Top-1 accuracy** | **44%** |
| **Top-5 accuracy** | **62%** |
| Random baseline | 0.13% |
| Nonsense-input confidence | 23.4 (correctly rejected) |

Two findings changed the product:

**Top-5 carries far more truth than top-1.** An 18-point gap meant the honest
unit of output was a *ranked shortlist*, not a single answer.

**Confidence did not track correctness.** Wrong answers scored as high as 53;
right answers as low as 39. The score separates signal from noise but cannot
separate right from wrong — so presenting it as a precise percentage would be
a lie dressed as data.

### 3. Diagnosing a member of my own ensemble

Random Forest's output distribution had an **entropy of 6.62 against a
theoretical maximum of 6.65** — essentially uniform. Its top pick scored 0.22%
where chance is 0.129%. Cause: `max_depth=10` cannot span 776 classes, since a
depth-10 tree has at most 1,024 leaves.

The obvious move was to drop it. I measured first, and the data said otherwise:
removing RF cut top-1 from 44% → 38%, and — more importantly — raised the
confidence assigned to *nonsense* input from 23.4 to 33.3, dangerously close to
the acceptance threshold. **A weak classifier was doing useful work as an
uncertainty regulariser.** It stayed.

### 4. Knowing when a "hybrid" isn't one

The design validates ML predictions against a RAG knowledge base — apparently an
independent second opinion. It isn't: the ML training data was *generated from*
that same knowledge base, so the two signals are correlated and RAG confirms
ML's mistakes.

I tested re-ranking ML candidates by RAG evidence and it made accuracy **worse**
(41% → 35%). RAG is therefore used to *annotate* evidence for and against each
candidate, never to reorder them — with the rationale recorded in the source so
it isn't "fixed" later.

---

## Designing for a model that is wrong 56% of the time

The original UI displayed one disease, a percentage to one decimal place, and
three fluent AI-authored paragraphs explaining it — for a prediction that was
wrong more often than right. Fluency reads as authority, which is precisely
wrong in a medical context.

The rebuilt result surface:

- **A ranked shortlist**, not a verdict — recovering the 18-point top-1/top-5 gap
- **Evidence both ways** — what supports each candidate, and which of its
  *defining* symptoms the user never reported
- **An explicit warning** when a highly ranked condition has none of its
  defining symptoms present — the model's signature failure mode
- **Strength bands** (Strong/Moderate/Weak) instead of `40.7%`, which implies a
  calibrated probability the system does not have
- **An LLM prompted to compare, not justify.** Given the whole shortlist plus
  the evidence, it now writes things like *"the patient hasn't reported any
  shortness of breath, which is a key symptom of ARDS — this makes it less
  likely despite being the top-ranked candidate."*

---

## Defects found and fixed

Each of these was found by measurement or type-checking, not by reading code:

| Defect | Impact |
|---|---|
| Unbounded loop in Jaro-Winkler transposition counting | Infinite hang on real symptom pairs; RAG had been disabled entirely to work around it |
| Substring disease matching | `"flu"` matches `"re**flu**x"` — influenza silently resolved to GERD |
| LLM jargon outside the model vocabulary | `polydipsia`/`polyuria` unmapped turned textbook diabetes into *Primary Thrombocythemia* |
| `parseInt()` on cuid string IDs | Editing a reminder always returned 400; fetching a chat session always 404'd |
| `.env.local` saved as UTF-16 | dotenv parsed **zero** variables; `JWT_SECRET` silently used its insecure default |
| Emoji in `print()` under cp1252 | ML service crashed on startup on Windows before binding its port |
| `backend/` in no tsconfig | The entire backend was never type-checked; `@types/express` was missing outright |

The backend type errors only became visible after adding a `tsconfig.backend.json`
and the missing Express types — which then immediately surfaced the cuid bugs.

---

## Frontend

A glassmorphic interface built with **zero animation dependencies** — the
entire visual system costs **+3.5 KB gzipped CSS and +3.4 KB gzipped JS**:

- Animated aurora backdrop — frosted glass only reads as glass when there is
  something varied behind it to refract
- Pointer-reactive lighting driven by a damped `requestAnimationFrame` loop
  writing CSS custom properties **directly to the DOM**, so React never
  re-renders on mouse move
- 3D card tilt, magnetic buttons, staggered scroll reveals, animated conic
  gradient borders via a registered `@property`
- Only `transform`/`opacity` are ever animated; `prefers-reduced-motion`
  disables everything and shows all content immediately

---

## Engineering practice

- **32 automated tests**, including regression tests that pin the infinite-loop
  fix and verify Jaro-Winkler against its canonical reference value
- **Type-checked end to end** — separate frontend and backend projects
- **CI** on every push: typecheck → test → build
- **Repository hygiene** — three artifacts exceeded GitHub's 100 MB per-file
  limit and were purged from history (`.git`: 318 MB → 3.3 MB) with model
  regeneration documented in [MODELS.md](MODELS.md)

---

## Known limitations

Stated plainly, because a medical tool that overstates itself is worse than one
that admits its ceiling:

1. **44% top-1 accuracy.** Useful as a symptom-similarity shortlist; not a
   diagnostic tool. The UI is designed to say so.
2. **Many of the 776 classes are not separable from symptoms alone.** Pneumonia
   has 1,212 training rows and still loses to Pulmonary Eosinophilia's 185 —
   the discriminating information was never in the input.
3. **Severe class imbalance** — 1219:1, with 96 classes having fewer than 10
   training rows.
4. **No temporal, severity, demographic or history signal.** The model sees
   symptom presence only.
5. **~40–60s per diagnosis** on local hardware, dominated by LLM generation.

## Roadmap

1. **Group the 776 classes into ~150 clinically coherent families** — removing
   distinctions the input genuinely cannot support. Estimated top-1: ~70%.
   Grouping must follow clinical urgency, never body system alone: the model
   currently predicts *Intracerebral Hemorrhage* for a migraine, and merging
   those would hide exactly the distinction that matters.
2. **Retrain Random Forest** at a depth that can span the class space.
3. **Expand the feature space** — `max_features=1000` cannot represent 377
   distinct symptoms; 173 symptom names are 3+ words and can never be matched
   at `ngram_range=(1,2)`.
4. **Re-calibrate after grouping**, since the lift baseline shifts with class
   count.

---

> ⚠️ This is an educational project. It is not a medical device and must not be
> used for clinical decisions.
