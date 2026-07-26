import os
import pandas as pd
import numpy as np
import xgboost as xgb
import shap
import pickle
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATA_PATH = "data/paper_machine_telemetry.csv"
MODELS_DIR = "models"
MODEL_PATH = os.path.join(MODELS_DIR, "basis_weight_model.pkl")
EXPLAINER_PATH = os.path.join(MODELS_DIR, "shap_explainer.pkl")

# Features to use for predicting basis weight
FEATURES = [
    'machine_speed_fpm',
    'steam_pressure_psi',
    'headbox_flow',
    'stock_consistency',
    'refiner_load',
    'slice_opening',
    'steam_temperature',
    'dryer_temperature'
]
TARGET = 'basis_weight'

def train_and_save_models():
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    if not os.path.exists(DATA_PATH):
        logger.error(f"Dataset not found at {DATA_PATH}. Please run generate_dataset.py first.")
        return

    logger.info("Loading dataset...")
    df = pd.read_csv(DATA_PATH)
    
    # Simple preprocessing
    df = df.dropna(subset=FEATURES + [TARGET])
    
    X = df[FEATURES]
    y = df[TARGET]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    logger.info("Training XGBoost Regressor for Basis Weight Prediction...")
    # Fast training configuration
    model = xgb.XGBRegressor(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    preds = model.predict(X_test)
    mse = mean_squared_error(y_test, preds)
    r2 = r2_score(y_test, preds)
    logger.info(f"Model Evaluation - MSE: {mse:.4f}, R2: {r2:.4f}")
    
    # Save the model
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    logger.info(f"Model saved to {MODEL_PATH}")
    
    # Initialize and save SHAP explainer
    logger.info("Initializing SHAP TreeExplainer...")
    explainer = shap.TreeExplainer(model)
    with open(EXPLAINER_PATH, 'wb') as f:
        pickle.dump(explainer, f)
    logger.info(f"SHAP Explainer saved to {EXPLAINER_PATH}")
    
if __name__ == "__main__":
    train_and_save_models()
