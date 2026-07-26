import pandas as pd
import os
import logging

logger = logging.getLogger(__name__)

class DatasetCache:
    _df = None

    @classmethod
    def load(cls):
        if cls._df is None:
            logger.info("Loading paper_machine_telemetry.csv into memory cache...")
            try:
                base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
                data_path = os.path.join(base_dir, "ml", "data", "paper_machine_telemetry.csv")
                cls._df = pd.read_csv(data_path)
                logger.info(f"Loaded dataset with {len(cls._df)} rows.")
            except Exception as e:
                logger.error(f"Failed to load dataset: {e}")
                cls._df = pd.DataFrame() # Fallback empty DF
        return cls._df

    @classmethod
    def get_df(cls):
        if cls._df is None:
            return cls.load()
        return cls._df
