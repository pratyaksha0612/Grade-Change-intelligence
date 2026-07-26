import logging
import uuid
import pickle
import os
from typing import Dict, Any

logger = logging.getLogger(__name__)

class ModelLoader:
    """
    Handles loading and version management of Machine Learning models.
    (Upgraded to load true XGBoost and SHAP artifacts)
    """
    def __init__(self):
        self.active_model_version_id = uuid.uuid4()
        self.is_loaded = False
        self.model = None
        self.explainer = None
        
        # Determine paths relative to this file
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
        self.models_dir = os.path.join(base_dir, "ml", "models")
        self.model_path = os.path.join(self.models_dir, "basis_weight_model.pkl")
        self.explainer_path = os.path.join(self.models_dir, "shap_explainer.pkl")

    async def load_model(self, model_name: str = "basis_weight_predictor"):
        """
        Loads the trained XGBoost model and SHAP explainer into memory.
        """
        logger.info(f"Loading true ML model '{model_name}' from {self.models_dir}...")
        
        if not os.path.exists(self.model_path):
            logger.error(f"Model file not found at {self.model_path}. Run train_models.py first.")
            return
            
        with open(self.model_path, 'rb') as f:
            self.model = pickle.load(f)
            
        if os.path.exists(self.explainer_path):
            with open(self.explainer_path, 'rb') as f:
                self.explainer = pickle.load(f)
        
        self.is_loaded = True
        logger.info(f"Model '{model_name}' and Explainer loaded successfully. Version ID: {self.active_model_version_id}")

    def get_version_id(self) -> uuid.UUID:
        return self.active_model_version_id

model_loader = ModelLoader()
