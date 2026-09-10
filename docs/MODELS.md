# Models & Datasets

Three artifacts are **deliberately not committed** because each exceeds GitHub's
100 MB hard limit for a single file:

| File | Size | Why it's excluded |
|---|---|---|
| `models/svm.pkl` | 335 MB | 3.3× over GitHub's limit |
| `models/random_forest.pkl` | 122 MB | over GitHub's limit |
| `datasets/Final_Augmented_dataset_Diseases_and_Symptoms.csv` | 182 MB | over GitHub's limit |

Everything else — `naive_bayes.pkl`, `label_encoder.pkl`, `tfidf_vectorizer.pkl`
and `training_data.csv` — **is** committed, so the repo is small and still runs.

## Getting the models

### Option 1 — let the service train them (simplest)

`ml_service.py` trains automatically on first run if no models are found:

```bash
npm run ml          # or: python ml_service.py
```

Without the large dataset it trains from the committed `training_data.csv`.
That produces a **smaller, faster model over fewer disease classes** than the
one described in the README, so predictions will differ from the numbers quoted
there.

### Option 2 — full retrain (matches the documented behaviour)

Reproduces the ~776-class ensemble the README's accuracy figures refer to.
Requires the large dataset (see below):

```bash
npm run ml:train    # or: python train_models.py
```

Writes all five artifacts into `models/`. Expect this to take a while —
`SVC(probability=True)` scales poorly on ~247k rows.

### Option 3 — download a prebuilt release

If a GitHub Release is published, attach the `.pkl` files there and download
them into `models/`. Release assets allow up to 2 GB each and do not count
against repository size, which is the conventional way to ship model weights.

## The dataset

`datasets/Final_Augmented_dataset_Diseases_and_Symptoms.csv` is a public
Kaggle dataset of disease/symptom pairs:

- ~247,000 rows
- 773 disease classes
- 377 binary symptom columns

> Add the exact Kaggle URL here before publishing so others can reproduce the
> training run.

Place it at `datasets/Final_Augmented_dataset_Diseases_and_Symptoms.csv`, then
run Option 2.

## A note on accuracy

Measured on a fixed battery of textbook presentations, the full 776-class
ensemble scores roughly **45% top-1** and **64% top-5**. The API therefore
returns a ranked `differential` rather than a single answer, and the UI presents
it as a shortlist of symptom matches — not a diagnosis. See the README section
"A note on ML confidence" for how the calibrated score is derived.
