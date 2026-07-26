export const API_ENDPOINTS = {
  PREDICTION: {
    FORECAST: '/prediction/trigger',
    STATUS: '/prediction/status',
    RESULT: '/prediction/result',
    HEALTH: '/prediction/health',
  },
  ROOT_CAUSE: {
    ANALYZE: '/root-cause/trigger',
    STATUS: '/root-cause/status',
    RESULT: '/root-cause/result',
    HEALTH: '/root-cause/health',
  },
  RECOMMENDATION: {
    GENERATE: '/recommendation/trigger',
    STATUS: '/recommendation/status',
    RESULT: '/recommendation/result',
    HEALTH: '/recommendation/health',
  },
  DIGITAL_TWIN: {
    SIMULATE: '/digital-twin/trigger',
    STATUS: '/digital-twin/status',
    RESULT: '/digital-twin/result',
    HEALTH: '/digital-twin/health',
  },
  KNOWLEDGE_BASE: {
    RECIPES: '/knowledge-base/recipes',
    LIMITS: '/knowledge-base/constraints',
    RULES: '/knowledge-base/rules',
    SUMMARY: '/knowledge-base/variables',
  },
  TIMELINE: {
    EVENTS: '/timeline/trigger',
    STATUS: '/timeline/status',
    RESULT: '/timeline/result',
    HEALTH: '/timeline/health',
  },
  DECISION: {
    FUSE: '/decision/trigger',
    STATUS: '/decision/status',
    RESULT: '/decision/result',
    HEALTH: '/decision/health',
  },
  DECISION_INTELLIGENCE: {
    ASSESSMENT: '/decision/trigger',
    STATUS: '/decision/status',
    RESULT: '/decision/result',
    HEALTH: '/decision/health',
  },
  EXPLAINABILITY: {
    AUDIT: '/explainability/trigger',
    STATUS: '/explainability/status',
    RESULT: '/explainability/result',
    HEALTH: '/explainability/health',
  },
  SETTINGS: {
    CONFIG: '/settings/health',
  }
} as const;
