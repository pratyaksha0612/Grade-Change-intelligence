# Import all models here so Alembic can discover them for migrations.
# Make sure app.db.base_class is imported first to get the Base metadata.

from app.db.base_class import Base

# Domain A: IAM
from .iam import User, Role, Permission, UserRole, RolePermission, Session

# Domain B: Assets
from .assets import Plant, ProductionLine, Machine, MachineSection

# Domain C: Config
from .config import ProcessVariable, Grade, GradeRecipe, RecipeParameter, ProcessConstraint, EngineeringRule

# Domain D: Ops
from .ops import GradeChangeSession, TransitionPhase, SensorData, FeatureVector

# Domain E: AI
from .ai import (
    Prediction, PredictionHorizon, Recommendation, RecommendationSetpoint,
    ConfidenceScore, RootCauseReport, RootCauseFactor, TimelinePrediction,
    DigitalTwinSimulation, SimilarityReport, HistoricalMatch
)

# Domain F: Feedback
from .feedback import OperatorFeedback, FeedbackValidation

# Domain G: Alerts
from .alerts import Alarm, Notification

# Domain H: Audit
from .audit import AuditLog

# Domain I: MLOps
from .mlops import MLModel, MLModelVersion, MLTrainingRun, MLDriftMetric, MLFeatureStoreMetadata

# Expose Base so env.py can just import `from app.models import Base`
__all__ = ["Base"]
