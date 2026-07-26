from transitions import Machine
import logging

logger = logging.getLogger(__name__)

class GradeChangeStateMachine:
    """
    Finite State Machine determining the exact phase of a grade change.
    """
    states = ['STEADY_STATE', 'INITIATED', 'RAMPING', 'OFF_SPEC', 'STABILIZING', 'ON_SPEC']

    transitions = [
        # DCS Triggers new target grade
        {'trigger': 'trigger_initiate', 'source': ['STEADY_STATE', 'ON_SPEC'], 'dest': 'INITIATED'},
        
        # Actuators start moving
        {'trigger': 'trigger_ramp', 'source': 'INITIATED', 'dest': 'RAMPING'},
        
        # Paper quality breaches target spec
        {'trigger': 'trigger_off_spec', 'source': 'RAMPING', 'dest': 'OFF_SPEC'},
        
        # Paper quality re-enters target spec bounds
        {'trigger': 'trigger_stabilize', 'source': 'OFF_SPEC', 'dest': 'STABILIZING'},
        
        # Paper quality holds within bounds for N minutes
        {'trigger': 'trigger_on_spec', 'source': 'STABILIZING', 'dest': 'ON_SPEC'},
        
        # Fallback/Reset
        {'trigger': 'trigger_reset', 'source': '*', 'dest': 'STEADY_STATE'}
    ]

    def __init__(self, machine_id: str, initial_state: str = 'STEADY_STATE'):
        self.machine_id = machine_id
        self.machine = Machine(
            model=self, 
            states=self.states, 
            transitions=self.transitions, 
            initial=initial_state,
            send_event=True
        )
        
    def evaluate_state(self, features: dict, recipe_limits: dict) -> str:
        """
        Evaluates the feature vector against recipe limits to advance the state machine.
        """
        # Placeholder logic: In a real environment, this looks at Basis Weight / Moisture against limits
        
        current_bw = features.get('basis_weight_pv')
        target_bw = recipe_limits.get('basis_weight_sp')
        bw_low_limit = recipe_limits.get('basis_weight_low_limit')
        bw_high_limit = recipe_limits.get('basis_weight_high_limit')
        
        if not all([current_bw, target_bw, bw_low_limit, bw_high_limit]):
            return self.state
            
        # Example pseudo-logic:
        # If we are RAMPING and basis weight falls outside the new grade's acceptable limits
        if self.state == 'RAMPING':
            if current_bw < bw_low_limit or current_bw > bw_high_limit:
                self.trigger_off_spec()
                
        elif self.state == 'OFF_SPEC':
            if bw_low_limit <= current_bw <= bw_high_limit:
                self.trigger_stabilize()
                
        elif self.state == 'STABILIZING':
            # Needs to hold for time T. Simplified here.
            self.trigger_on_spec()

        return self.state
