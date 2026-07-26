from typing import List
from app.schemas.similarity import HistoricalMatchSchema

class SimilarityRanker:
    """
    Ranks historical matches and calculates confidence in the retrieved outcomes.
    """
    
    @staticmethod
    def rank_matches(matches: List[HistoricalMatchSchema]) -> List[HistoricalMatchSchema]:
        """
        Sorts matches descending by similarity score.
        """
        return sorted(matches, key=lambda x: x.similarity_score, reverse=True)
        
    @staticmethod
    def calculate_confidence(ranked_matches: List[HistoricalMatchSchema]) -> float:
        """
        Calculates the overall confidence that these historical matches represent the current situation.
        """
        if not ranked_matches:
            return 0.0
            
        # Extract top similarity score
        top_score = ranked_matches[0].similarity_score
        
        # Penalize confidence if the top match is weak (< 80%)
        # or if there are very few matches (handled implicitly here)
        confidence = top_score / 100.0
        
        if top_score < 80.0:
            confidence *= 0.8
            
        return round(max(0.0, min(1.0, confidence)), 3)
