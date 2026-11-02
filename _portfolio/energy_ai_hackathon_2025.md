---
title: "Energy A.I. Hackathon 2025 – Predictive Energy Modeling"
excerpt: "An award-winning machine learning project to forecast energy consumption during hydraulic fracturing operations."
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

[View on GitHub](https://github.com/paawandesai/energy-ai-hackathon-2025/tree/main)  
Check out the presentation [here!](https://github.com/paawandesai/energy-ai-hackathon-2025/blob/main/datacomrades_final.pptx)  

### Overview
As part of the Energy A.I. Hackathon 2025, our team developed a machine learning pipeline to predict energy consumption (**Grid, Diesel, and CNG**) for hydraulic fracturing operations. The project integrated robust uncertainty modeling, advanced feature engineering, and domain-specific insights, earning **1st Place** out of 25 teams.  

### Key Features
- **High Prediction Accuracy:** Achieved **R²** scores of 0.9918 (Grid), 0.9766 (Diesel), and 0.9692 (CNG) using **XGBoost** and **Random Forest** models.  
- **Uncertainty Modeling:** Quantified prediction uncertainty with 100 realizations per well.  
- **Feature Engineering:** Leveraged **CatBoost encoding**, feature ranking, and temporal modeling to enhance predictions.  
- **Custom Libraries:** Integrated **ozbayrak_goodness** for model evaluation and **UTuning** for hyperparameter optimization.

### Tools Used
- **Programming Languages:** Python  
- **Libraries/Frameworks:** scikit-learn, XGBoost, Pandas, NumPy, CatBoost  
- **Custom Libraries:** ozbayrak_goodness, UTuning  

### Achievements
- **First Place Winners:** Secured top position among 25 teams in accuracy (MAPE), code quality, and presentation.  

