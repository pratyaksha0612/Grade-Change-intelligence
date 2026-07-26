import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

# Configuration
NUM_ROWS = 100000
OUTPUT_DIR = "data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "paper_machine_telemetry.csv")

def generate_dataset(num_rows=NUM_ROWS):
    print(f"Generating synthetic dataset with {num_rows} records...")
    
    # Initialize basic arrays
    np.random.seed(42)
    start_time = datetime(2026, 1, 1, 0, 0, 0)
    timestamps = [start_time + timedelta(seconds=i) for i in range(num_rows)]
    
    # Grade logic: Changes every ~20,000 rows (approx 5.5 hours)
    grades = ['42# Linerboard', '55# Linerboard', '35# Medium', '69# Linerboard']
    transition_ids = []
    current_grades = []
    target_grades = []
    
    current_g = grades[0]
    target_g = grades[1]
    trans_id = 1
    
    for i in range(num_rows):
        if i > 0 and i % 20000 == 0:
            current_g = target_g
            target_g = np.random.choice([g for g in grades if g != current_g])
            trans_id += 1
            
        transition_ids.append(f"TR-{trans_id:04d}")
        current_grades.append(current_g)
        target_grades.append(target_g)

    # Base operating parameters (normal conditions)
    # Adding autocorrelation (random walk with bounds) to make time series realistic
    def random_walk(length, start_val, volatility, mean_reversion=0.01, target=None):
        vals = [start_val]
        if target is None:
            target = start_val
        for i in range(1, length):
            change = np.random.normal(0, volatility)
            pull = (target - vals[-1]) * mean_reversion
            vals.append(vals[-1] + change + pull)
        return np.array(vals)

    machine_speed = random_walk(num_rows, 2500, 2, target=2500)
    steam_pressure = random_walk(num_rows, 120, 0.5, target=120)
    headbox_flow = random_walk(num_rows, 14000, 10, target=14000)
    stock_consistency = random_walk(num_rows, 3.2, 0.01, target=3.2)
    refiner_load = random_walk(num_rows, 850, 1, target=850)
    slice_opening = random_walk(num_rows, 20.5, 0.05, target=20.5)
    
    # Dependent variables (correlations)
    steam_temperature = steam_pressure * 3.5 + np.random.normal(0, 5, num_rows)
    dryer_temperature = steam_temperature * 0.8 + np.random.normal(0, 2, num_rows)
    web_tension = machine_speed * 0.01 + np.random.normal(0, 0.5, num_rows)
    ambient_temperature = random_walk(num_rows, 75, 0.1, target=75) # Slow changing
    ambient_humidity = random_walk(num_rows, 45, 0.2, target=45)
    energy_consumption = (machine_speed * 0.5) + (refiner_load * 0.2) + np.random.normal(0, 10, num_rows)
    machine_vibration = (machine_speed * 0.001) + np.random.normal(0, 0.1, num_rows)

    # Core outputs
    # Basis weight depends on headbox flow, stock consistency, machine speed
    basis_weight_target = np.array([float(g.split('#')[0]) for g in current_grades])
    
    # Injecting anomalies (Root Causes)
    root_causes = ['Normal'] * num_rows
    recommended_actions = ['None'] * num_rows
    
    basis_weight = np.zeros(num_rows)
    moisture = np.zeros(num_rows)
    
    # Generate periods of anomalies
    anomaly_indices = np.random.choice(num_rows, size=50, replace=False)
    for idx in anomaly_indices:
        # Anomaly lasts for 100-300 seconds
        duration = np.random.randint(100, 300)
        end_idx = min(idx + duration, num_rows)
        
        cause_type = np.random.choice([
            'Steam Pressure', 'Machine Speed', 'Headbox Flow', 
            'Moisture', 'Stock Consistency', 'Refiner Load'
        ])
        
        for j in range(idx, end_idx):
            root_causes[j] = cause_type
            
            if cause_type == 'Steam Pressure':
                steam_pressure[j] -= np.random.uniform(2, 5) # Drop in pressure
                recommended_actions[j] = 'Increase Steam Pressure'
            elif cause_type == 'Machine Speed':
                machine_speed[j] += np.random.uniform(50, 150) # Speed surge
                recommended_actions[j] = 'Reduce Machine Speed'
            elif cause_type == 'Headbox Flow':
                headbox_flow[j] -= np.random.uniform(200, 500)
                recommended_actions[j] = 'Increase Headbox Flow'
            elif cause_type == 'Moisture':
                steam_temperature[j] -= np.random.uniform(10, 20)
                recommended_actions[j] = 'Optimize Dryer Section'
            elif cause_type == 'Stock Consistency':
                stock_consistency[j] += np.random.uniform(0.1, 0.3)
                recommended_actions[j] = 'Dilute Stock Flow'
            elif cause_type == 'Refiner Load':
                refiner_load[j] += np.random.uniform(30, 80)
                recommended_actions[j] = 'Adjust Refiner Plates'

    # Calculate actual basis weight based on relationships
    for i in range(num_rows):
        # Base physical relationship
        bw = basis_weight_target[i] + \
             (headbox_flow[i] - 14000) * 0.001 + \
             (stock_consistency[i] - 3.2) * 5 - \
             (machine_speed[i] - 2500) * 0.01 + \
             np.random.normal(0, 0.2)
        
        m = 6.5 - (dryer_temperature[i] - 330) * 0.01 + (machine_speed[i] - 2500) * 0.005 + np.random.normal(0, 0.1)
        
        basis_weight[i] = bw
        moisture[i] = m

    # Predicted basis weight (simulating a model output with some error)
    predicted_basis_weight = basis_weight + np.random.normal(0, 0.15, num_rows)
    basis_weight_deviation = basis_weight - basis_weight_target
    
    # Quality status
    quality_pass = np.abs(basis_weight_deviation) <= 1.5 # Spec limit
    quality_status = ['ON_SPEC' if q else 'OFF_SPEC' for q in quality_pass]
    
    df = pd.DataFrame({
        'timestamp': timestamps,
        'transition_id': transition_ids,
        'current_grade': current_grades,
        'target_grade': target_grades,
        'machine_speed_fpm': machine_speed,
        'steam_pressure_psi': steam_pressure,
        'steam_temperature': steam_temperature,
        'basis_weight': basis_weight,
        'moisture': moisture,
        'headbox_flow': headbox_flow,
        'stock_consistency': stock_consistency,
        'refiner_load': refiner_load,
        'slice_opening': slice_opening,
        'dryer_temperature': dryer_temperature,
        'web_tension': web_tension,
        'ambient_temperature': ambient_temperature,
        'ambient_humidity': ambient_humidity,
        'energy_consumption': energy_consumption,
        'machine_vibration': machine_vibration,
        'predicted_basis_weight': predicted_basis_weight,
        'basis_weight_deviation': basis_weight_deviation,
        'quality_pass': quality_pass,
        'quality_status': quality_status,
        'root_cause': root_causes,
        'recommended_action': recommended_actions
    })
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"Dataset successfully saved to {OUTPUT_FILE}")
    print(df.head())
    
if __name__ == "__main__":
    generate_dataset()
