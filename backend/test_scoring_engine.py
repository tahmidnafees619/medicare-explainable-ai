#!/usr/bin/env python3
"""
Unit tests for ML confidence scoring engine (Stage 2)
- softmax weighting
- disagreement penalty
- adaptive weight selection
"""

import numpy as np
import sys

def softmax(scores, temperature=25):
    """Softmax normalization with temperature"""
    scores_arr = np.array(scores)
    e = np.exp(scores_arr / temperature)
    return (e / e.sum()).tolist()

def get_adaptive_weights(adjusted_ml):
    """Stage 4: Adaptive weight selection"""
    if adjusted_ml >= 65:
        return 0.75, 0.25
    elif adjusted_ml >= 45:
        return 0.65, 0.35
    else:
        return 0.50, 0.50

def get_agreement_level(std_dev):
    """Model agreement level from std dev"""
    if std_dev < 10:
        return 'high'
    elif std_dev < 25:
        return 'medium'
    else:
        return 'low'

def run_tests():
    passed = 0
    failed = 0

    print("=" * 60)
    print("ML SCORING ENGINE TESTS")
    print("=" * 60)

    # ── Test 1: Softmax weights ─────────────────────────────────────────────
    print("\nTest 1: Softmax weighting")
    print("-" * 40)
    scores1 = [80, 60, 40]
    weights1 = softmax(scores1)
    print(f"  Input scores: {scores1}")
    print(f"  Softmax weights: {[round(w, 4) for w in weights1]}")
    # Higher score should get higher weight
    assert weights1[0] > weights1[1] > weights1[2], "FAIL: weights not in descending order"
    assert abs(sum(weights1) - 1.0) < 1e-5, "FAIL: weights don't sum to 1"
    print("  [PASS] Weights are properly ordered and sum to 1")
    passed += 1

    # ── Test 2: Softmax temperature effect ──────────────────────────────────
    print("\nTest 2: Softmax temperature effect")
    print("-" * 40)
    scores2 = [80, 40, 20]
    weights_low_temp = softmax(scores2, temperature=10)
    weights_high_temp = softmax(scores2, temperature=50)
    print(f"  Input scores: {scores2}")
    print(f"  Temp=10 weights: {[round(w, 4) for w in weights_low_temp]}")
    print(f"  Temp=50 weights: {[round(w, 4) for w in weights_high_temp]}")
    # Lower temperature increases separation
    spread_low = max(weights_low_temp) - min(weights_low_temp)
    spread_high = max(weights_high_temp) - min(weights_high_temp)
    assert spread_low > spread_high, "FAIL: lower temp should increase spread"
    print("  [PASS] Temperature correctly controls weight spread")
    passed += 1

    # ── Test 3: Disagreement penalty ───────────────────────────────────────
    print("\nTest 3: Disagreement penalty")
    print("-" * 40)
    model_scores_a = [80, 80, 80]  # high agreement
    model_scores_b = [95, 50, 15]  # low agreement
    std_a = np.std(model_scores_a)
    std_b = np.std(model_scores_b)
    penalty_a = std_a * 0.25
    penalty_b = std_b * 0.25
    print(f"  High agreement scores: {model_scores_a}, std={std_a:.2f}, penalty={penalty_a:.2f}")
    print(f"  Low agreement scores:  {model_scores_b}, std={std_b:.2f}, penalty={penalty_b:.2f}")
    assert penalty_a < penalty_b, "FAIL: high agreement should have smaller penalty"
    assert penalty_a == 0.0, "FAIL: perfect agreement should give 0 penalty"
    print("  [PASS] Disagreement penalty scales with std deviation")
    passed += 1

    # ── Test 4: Adjusted ML confidence ─────────────────────────────────────
    print("\nTest 4: Adjusted ML confidence")
    print("-" * 40)
    weighted_raw = 70.0
    disagreement = 5.65
    adjusted = max(0, weighted_raw - disagreement)
    print(f"  Weighted raw: {weighted_raw}, penalty: {disagreement}, adjusted: {adjusted}")
    assert adjusted == 64.35, "FAIL: adjusted confidence calculation incorrect"
    print("  [PASS] Adjusted confidence = weighted_raw - disagreement_penalty")
    passed += 1

    # ── Test 5: Adaptive weight selection ───────────────────────────────────
    print("\nTest 5: Adaptive weight thresholds")
    print("-" * 40)
    test_cases = [
        (80, (0.75, 0.25), "high confidence ML"),
        (65, (0.75, 0.25), "boundary >=65"),
        (55, (0.65, 0.35), "medium confidence ML"),
        (45, (0.65, 0.35), "boundary >=45"),
        (30, (0.50, 0.50), "low confidence ML"),
        (0,  (0.50, 0.50), "very low confidence"),
    ]
    for ml_score, expected, desc in test_cases:
        ml_w, rag_w = get_adaptive_weights(ml_score)
        assert (ml_w, rag_w) == expected, f"FAIL: {desc} expected {expected} got {(ml_w, rag_w)}"
        print(f"  ML={ml_score:>3} -> ML_w={ml_w}, RAG_w={rag_w} [PASS]")
    passed += 1

    # ── Test 6: Agreement level classification ──────────────────────────────
    print("\nTest 6: Agreement level classification")
    print("-" * 40)
    assert get_agreement_level(5) == 'high', "FAIL: std<10 should be high"
    assert get_agreement_level(15) == 'medium', "FAIL: 10<=std<25 should be medium"
    assert get_agreement_level(30) == 'low', "FAIL: std>=25 should be low"
    print("  [PASS] std<10 -> high, 10-24 -> medium, >=25 -> low")
    passed += 1

    # ── Test 7: Full pipeline simulation ────────────────────────────────────
    print("\nTest 7: Full pipeline simulation")
    print("-" * 40)
    # Simulate: RF=75, SVM=65, NB=55 (moderate agreement)
    model_scores = [75, 65, 55]
    weights = softmax(model_scores)
    weighted_raw = sum(s * w for s, w in zip(model_scores, weights))
    std_dev = np.std(model_scores)
    penalty = std_dev * 0.25
    adjusted_ml = max(0, weighted_raw - penalty)
    ml_w, rag_w = get_adaptive_weights(adjusted_ml)

    print(f"  Model scores: {model_scores}")
    print(f"  Dynamic weights: {[round(w, 4) for w in weights]}")
    print(f"  Weighted raw ML: {weighted_raw:.2f}")
    print(f"  StdDev: {std_dev:.2f}, Penalty: {penalty:.2f}")
    print(f"  Adjusted ML: {adjusted_ml:.2f}")
    print(f"  Hybrid weights: ML={ml_w}, RAG={rag_w}")

    # Verify adjusted_ml is between min and max model score
    assert adjusted_ml <= max(model_scores), "FAIL: adjusted cannot exceed best model"
    assert adjusted_ml >= min(model_scores), "FAIL: adjusted should not go below worst"
    assert ml_w + rag_w == 1.0, "FAIL: weights must sum to 1"
    print("  [PASS] Full pipeline produces valid confidence scores")
    passed += 1

    # Summary
    print("\n" + "=" * 60)
    print(f"RESULTS: {passed} passed, {failed} failed")
    print("=" * 60)
    return failed == 0

if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)
