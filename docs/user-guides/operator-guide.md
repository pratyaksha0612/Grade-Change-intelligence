# Operator User Guide — GradeChange Intelligence Platform

**Document ID:** HPS-GCI-UG-OP-001
**Version:** 1.0
**Last Updated:** 2026-07-25

---

## 1. What is GCI?

The **GradeChange Intelligence (GCI)** system is an AI-powered advisory tool that helps you during paper grade changes by:

- **Predicting** whether Basis Weight will go out of spec before it happens
- **Recommending** setpoint adjustments to prevent off-spec production
- **Explaining** why a prediction or recommendation was made, in clear process language

> **IMPORTANT:** GCI is an **advisory system only**. It does NOT automatically change any setpoints on the DCS. You always have final control.

---

## 2. Advisory Dashboard

### Understanding the Display

When a grade change is active, the GCI advisory panel appears on your HMI with these sections:

#### Risk Indicator
- 🟢 **SAFE** — Basis Weight is predicted to stay within ±2.5%
- 🟡 **WARNING** — Basis Weight is approaching the ±2.5% limit (within 1%)
- 🔴 **BREACH** — Basis Weight is predicted to exceed ±2.5%

#### Prediction Panel
Shows the predicted Basis Weight trajectory for the next 30, 60, 90, and 120 seconds, with confidence bands.

#### Recommendation Panel (appears on WARNING or BREACH)
Shows suggested setpoint adjustments with:
- Which variable to adjust (e.g., Steam Pressure)
- Current value and recommended value
- Expected outcome if you follow the recommendation

#### Explanation Panel
Tells you **why** the system made this prediction:
- Which process variable is the main driver
- How similar this transition is to past transitions
- How confident the system is

---

## 3. Responding to Recommendations

When a recommendation appears, you have three options:

| Action | When to Use |
|---|---|
| **ACCEPT** | You agree with the recommendation and will implement the suggested setpoint changes on the DCS |
| **REJECT** | You disagree with the recommendation (e.g., you know something the system doesn't) |
| **MODIFY** | You partially agree but want to adjust the recommended values |

> **Your feedback matters!** Every Accept/Reject/Modify decision helps the system learn and improve. Please respond to every recommendation.

---

## 4. Tips for Effective Use

1. **Don't ignore WARNING alerts** — They often precede BREACH alerts by 30–60 seconds
2. **Check the explanation** — The "Primary Driver" tells you which variable to watch most closely
3. **Review historical comparisons** — The system shows similar past transitions and their outcomes
4. **Trust but verify** — Compare recommendations to your process knowledge; reject if something feels wrong
5. **Add notes when rejecting** — Brief rationale helps the system learn (e.g., "Felt is worn, steam response different")

---

## 5. When the System Shows "Low Confidence"

If the confidence indicator shows < 70%, it means the system has limited experience with this particular type of transition. In this case:
- Predictions are still displayed but flagged as uncertain
- Rely more on your experience and standard operating procedures
- Your feedback is especially valuable for these cases

---

## 6. Troubleshooting

| Issue | Likely Cause | Action |
|---|---|---|
| Advisory panel not updating | WebSocket disconnected | Refresh the HMI page; check network |
| "DATA FEED INTERRUPTED" warning | Process data pipeline issue | Continue with standard DCS operations; notify support |
| No recommendation on BREACH alert | Optimization could not find a valid solution within constraints | Use manual adjustment based on experience |
| Predictions seem consistently wrong | Model may need retraining | Report to process engineer; continue using your judgment |
