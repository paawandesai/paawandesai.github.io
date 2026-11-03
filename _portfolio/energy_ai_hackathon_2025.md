---
title: "Energy A.I. Hackathon 2025 – Predictive Energy Modeling"
excerpt: "First place out of 25 teams: a model that predicts energy use during hydraulic fracturing, broken out by grid power, diesel and CNG."
collection: portfolio
layout: single
group: earlier
order: 1
flow_caption: "The modeling pipeline"
flow:
  - { t: "Well data", s: "grid, diesel, CNG" }
  - { t: "Feature engineering", s: "CatBoost encoding, ranking" }
  - { t: "XGBoost + Random Forest", s: "R\u00b2 up to 0.99", hot: true }
  - { t: "Uncertainty", s: "100 realizations per well", hot: true }
---

[View on GitHub](https://github.com/paawandesai/energy-ai-hackathon-2025/tree/main) · [Presentation](https://github.com/paawandesai/energy-ai-hackathon-2025/blob/main/datacomrades_final.pptx)

### Overview
For the Energy A.I. Hackathon 2025, my team built a model that predicts energy use during hydraulic fracturing operations, broken out by grid power, diesel and CNG. We placed first out of 25 teams, judged on accuracy, code quality and presentation.

### Approach
- XGBoost and Random Forest models reached R² of 0.99 for grid, 0.98 for diesel and 0.97 for CNG.
- We ran 100 realizations per well to measure the uncertainty of each prediction.
- Inputs were prepared with CatBoost encoding, feature ranking and time-based features.
- Models were evaluated with ozbayrak_goodness and tuned with UTuning.

### Tools
Python, scikit-learn, XGBoost, CatBoost, pandas, NumPy
