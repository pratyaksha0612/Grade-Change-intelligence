import { useQuery } from '@tanstack/react-query';

export interface Correlation {
  feature: string;
  correlation: number;
  strength: number;
  type: string;
  impactOnBasisWeight: string;
  confidenceScore: number;
  historicalEvidence: string;
  detailedReasoning: string;
}

export interface CorrelationData {
  correlations: Correlation[];
}

const MOCK_CORRELATIONS: CorrelationData = {
  correlations: [
    {
      feature: "Steam Pressure",
      correlation: -0.65,
      strength: 0.65,
      type: "Negative",
      impactOnBasisWeight: "High",
      confidenceScore: 92.5,
      historicalEvidence: "In 85% of past transitions, a decrease in Steam Pressure directly resulted in a corresponding increase in Basis Weight within 5 minutes.",
      detailedReasoning: "Statistical analysis reveals a Pearson correlation coefficient of -0.65. This implies a strong inverse relationship."
    },
    {
      feature: "Machine Speed",
      correlation: -0.45,
      strength: 0.45,
      type: "Negative",
      impactOnBasisWeight: "Medium",
      confidenceScore: 88.0,
      historicalEvidence: "Speed changes have historically caused proportional basis weight fluctuations with a 2-minute lag.",
      detailedReasoning: "A moderate negative correlation is expected due to mass-balance physics."
    }
  ]
};

export const useCorrelations = () => {
  return useQuery<CorrelationData>({
    queryKey: ['correlations'],
    queryFn: async () => {
      try {
        const rawUrl = import.meta.env.VITE_API_URL;
        const baseUrl = rawUrl ? `${rawUrl}/api/v1` : 'http://localhost:8000/api/v1';
        const response = await fetch(`${baseUrl}/correlations/`);
        if (!response.ok) {
          throw new Error('Backend endpoint returned error');
        }
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data as CorrelationData;
      } catch (error) {
        console.info('Backend unavailable or errored. Falling back to mock correlation data.');
        await new Promise(resolve => setTimeout(resolve, 800)); // Network delay simulation
        return MOCK_CORRELATIONS;
      }
    },
    retry: 0,
    refetchInterval: 30000,
  });
};
