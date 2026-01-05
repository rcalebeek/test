import json
import re

# Data van alle frames
data = {
    "ML251-B583": [{"A":"+1,56","B":"+1,63","C":"+1,64","D":"+1,69","E":"+1,42"},{"A":"+1,36","B":"+1,20","C":"+1,47","D":"+1,50","E":"+1,49"},{"A":"+1,06","B":"+0,91","C":"+1,44","D":"+1,61","E":"+1,44"},{"A":"+1,14","B":"+1,16","C":"+1,40","D":"+1,34","E":"+1,43"},{"A":"+0,94","B":"+1,16","C":"+1,59","D":"+1,61","E":"+1,28"},{"A":"+0,87","B":"+1,02","C":"+1,21","D":"+1,37","E":"+1,36"},{"A":"+1,14","B":"+1,27","C":"+1,47","D":"+1,38","E":"+1,26"},{"A":"+1,26","B":"+1,38","C":"+1,71","D":"+1,68","E":"+1,28"},{"A":"+1,20","B":"+1,46","C":"+1,74","D":"+1,98","E":"+1,69"},{"A":"+1,11","B":"+1,56","C":"+1,66","D":"+1,96","E":"+1,70"},{"A":"+1,18","B":"+1,66","C":"+1,69","D":"+1,88","E":"+1,44"},{"A":"+0,99","B":"+1,50","C":"+1,81","D":"+1,30","E":"+1,25"},{"A":"+1,64","B":"+1,72","C":"+1,32","D":"+1,46","E":"+1,56"},{"A":"+1,51","B":"+1,59","C":"+1,07","D":"+1,60","E":"+1,27"},{"A":"+1,00","B":"+1,25","C":"+1,84","D":"+1,39","E":"+1,37"},{"A":"+0,69","B":"+0,82","C":"+1,38","D":"+1,72","E":"+1,64"},{"A":"+1,03","B":"+1,27","C":"+1,56","D":"+1,79","E":"+1,45"},{"A":"+0,96","B":"+1,41","C":"+1,56","D":"+1,83","E":"+1,33"},{"A":"+1,09","B":"+1,22","C":"+1,32","D":"+1,63","E":"+1,42"},{"A":"+1,18","B":"+1,13","C":"+1,55","D":"+1,62","E":"+1,27"},{"A":"+0,60","B":"+0,85","C":"+1,29","D":"+1,36","E":"+1,12"},{"A":"+1,16","B":"+1,29","C":"+1,49","D":"+1,42","E":"+1,22"},{"A":"+1,07","B":"+1,16","C":"+1,53","D":"+1,44","E":"+1,05"},{"A":"+1,33","B":"+1,27","C":"+1,44","D":"+1,36","E":"+1,39"},{"A":"+0,76","B":"+1,27","C":"+1,61","D":"+1,68","E":"+1,61"},{"A":"+1,62","B":"+1,59","C":"+1,96","D":"+1,86","E":"+1,39"}]
}

def parse_value(val):
    """Convert string value like '+1,56' to float 1.56"""
    # Remove leading '+' or '-0,'
    val = val.strip()
    if val.startswith('+-'):
        val = val[1:]
    elif val.startswith('_'):
        val = val.replace('_', '-')

    # Handle special cases
    val = val.replace('+', '')
    val = val.replace(',', '.')

    # Clean up edge cases
    if val == '0.00':
        return 0.0

    try:
        return float(val)
    except:
        print(f"Warning: Could not parse '{val}'")
        return 0.0

def calculate_frame_averages(measurements):
    """Calculate average for each position (A-E) across all measurements"""
    positions = ['A', 'B', 'C', 'D', 'E']
    averages = {pos: [] for pos in positions}

    for measurement in measurements:
        for pos in positions:
            if pos in measurement:
                value = parse_value(measurement[pos])
                averages[pos].append(value)

    # Calculate means
    results = {}
    for pos in positions:
        if averages[pos]:
            results[pos] = sum(averages[pos]) / len(averages[pos])
        else:
            results[pos] = 0.0

    return results

# Calculate for the first frame as test
frame_name = "ML251-B583"
measurements = data[frame_name]
averages = calculate_frame_averages(measurements)

print(f"Frame: {frame_name}")
print(f"Number of measurements: {len(measurements)}")
print(f"\nAverages per position:")
for pos in ['A', 'B', 'C', 'D', 'E']:
    print(f"  {pos}: {averages[pos]:.3f}")
print(f"\nOverall average: {sum(averages.values()) / len(averages):.3f}")
