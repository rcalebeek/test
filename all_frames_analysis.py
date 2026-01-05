#!/usr/bin/env python3
"""
Frame Measurements Analysis
Calculate averages for each frame across all measurement positions (A, B, C, D, E)
"""

def parse_value(val):
    """Convert string value like '+1,56' to float 1.56"""
    val = str(val).strip()

    # Handle special prefix cases
    if val.startswith('+-'):
        val = '-' + val[2:]
    elif val.startswith('-+'):
        val = '-' + val[2:]
    elif val.startswith('_'):
        val = '-' + val[1:]
    elif val.startswith('+'):
        val = val[1:]

    # Replace comma with period for decimal
    val = val.replace(',', '.')

    # Clean up potential double periods
    while '..' in val:
        val = val.replace('..', '.')

    # Handle edge cases
    if not val or val == '' or val == '+' or val == '-':
        return 0.0

    try:
        return float(val)
    except ValueError:
        print(f"Warning: Could not parse '{val}', using 0.0")
        return 0.0

# ALL FRAME DATA
frames_data = {
    "ML251-B583": [{"A":"+1,56","B":"+1,63","C":"+1,64","D":"+1,69","E":"+1,42"},{"A":"+1,36","B":"+1,20","C":"+1,47","D":"+1,50","E":"+1,49"},{"A":"+1,06","B":"+0,91","C":"+1,44","D":"+1,61","E":"+1,44"},{"A":"+1,14","B":"+1,16","C":"+1,40","D":"+1,34","E":"+1,43"},{"A":"+0,94","B":"+1,16","C":"+1,59","D":"+1,61","E":"+1,28"},{"A":"+0,87","B":"+1,02","C":"+1,21","D":"+1,37","E":"+1,36"},{"A":"+1,14","B":"+1,27","C":"+1,47","D":"+1,38","E":"+1,26"},{"A":"+1,26","B":"+1,38","C":"+1,71","D":"+1,68","E":"+1,28"},{"A":"+1,20","B":"+1,46","C":"+1,74","D":"+1,98","E":"+1,69"},{"A":"+1,11","B":"+1,56","C":"+1,66","D":"+1,96","E":"+1,70"},{"A":"+1,18","B":"+1,66","C":"+1,69","D":"+1,88","E":"+1,44"},{"A":"+0,99","B":"+1,50","C":"+1,81","D":"+1,30","E":"+1,25"},{"A":"+1,64","B":"+1,72","C":"+1,32","D":"+1,46","E":"+1,56"},{"A":"+1,51","B":"+1,59","C":"+1,07","D":"+1,60","E":"+1,27"},{"A":"+1,00","B":"+1,25","C":"+1,84","D":"+1,39","E":"+1,37"},{"A":"+0,69","B":"+0,82","C":"+1,38","D":"+1,72","E":"+1,64"},{"A":"+1,03","B":"+1,27","C":"+1,56","D":"+1,79","E":"+1,45"},{"A":"+0,96","B":"+1,41","C":"+1,56","D":"+1,83","E":"+1,33"},{"A":"+1,09","B":"+1,22","C":"+1,32","D":"+1,63","E":"+1,42"},{"A":"+1,18","B":"+1,13","C":"+1,55","D":"+1,62","E":"+1,27"},{"A":"+0,60","B":"+0,85","C":"+1,29","D":"+1,36","E":"+1,12"},{"A":"+1,16","B":"+1,29","C":"+1,49","D":"+1,42","E":"+1,22"},{"A":"+1,07","B":"+1,16","C":"+1,53","D":"+1,44","E":"+1,05"},{"A":"+1,33","B":"+1,27","C":"+1,44","D":"+1,36","E":"+1,39"},{"A":"+0,76","B":"+1,27","C":"+1,61","D":"+1,68","E":"+1,61"},{"A":"+1,62","B":"+1,59","C":"+1,96","D":"+1,86","E":"+1,39"}],
    "ML251-B064": [{"A":"+1,01","B":"+1,22","C":"+1,55","D":"+1,38","E":"+0,77"},{"A":"+0,82","B":"+0,84","C":"+1,42","D":"+1,38","E":"+1,18"},{"A":"+0,73","B":"+0,83","C":"+1,27","D":"+1,14","E":"+0,51"},{"A":"+0,91","B":"+0,75","C":"+1,32","D":"+0,96","E":"+0,65"},{"A":"+0,82","B":"+0,85","C":"+1,45","D":"+1,04","E":"+0,85"},{"A":"+0,79","B":"+0,99","C":"+1,28","D":"+0,93","E":"+0,79"},{"A":"+0,86","B":"+1,11","C":"+1,54","D":"+1,22","E":"+0,99"},{"A":"+0,83","B":"+1,06","C":"+1,59","D":"+1,17","E":"+0,84"},{"A":"+1,08","B":"+1,37","C":"+1,77","D":"+1,34","E":"+0,97"},{"A":"+0,86","B":"+1,10","C":"+1,77","D":"+1,32","E":"+0,88"},{"A":"+1,06","B":"+1,12","C":"+1,55","D":"+1,19","E":"+0,93"},{"A":"+1,13","B":"+1,27","C":"+1,77","D":"+1,16","E":"+1,07"},{"A":"+1,04","B":"+1,28","C":"+1,08","D":"+0,92","E":"+0,30"},{"A":"+0,99","B":"+0,55","C":"+0,74","D":"+0,83","E":"+0,48"},{"A":"+0,81","B":"+0,92","C":"+1,57","D":"+1,11","E":"+0,72"},{"A":"+0,92","B":"+0,94","C":"+1,52","D":"+1,15","E":"+1,06"},{"A":"+0,86","B":"+0,68","C":"+1,46","D":"+1,34","E":"+0,91"},{"A":"+0,85","B":"+0,99","C":"+1,47","D":"+1,45","E":"+0,98"},{"A":"+0,70","B":"+0,88","C":"+1,53","D":"+1,30","E":"+0,91"},{"A":"+0,74","B":"+0,71","C":"+1,29","D":"+0,99","E":"+0,38"},{"A":"+0,76","B":"+0,90","C":"+1,51","D":"+1,20","E":"+0,67"},{"A":"+0,57","B":"+0,79","C":"+1,26","D":"+1,00","E":"+0,70"},{"A":"+0,81","B":"+0,79","C":"+1,32","D":"+0,99","E":"+0,62"},{"A":"+0,78","B":"+0,78","C":"+1,18","D":"+0,86","E":"+0,58"},{"A":"+0,75","B":"+0,88","C":"+1,31","D":"+1,06","E":"+0,87"},{"A":"+1,32","B":"+1,30","C":"+1,97","D":"+1,65","E":"+1,16"}]
}

def calculate_averages(measurements):
    """Calculate average for each position across all measurements"""
    positions = ['A', 'B', 'C', 'D', 'E']
    sums = {pos: 0.0 for pos in positions}
    counts = {pos: 0 for pos in positions}

    for measurement in measurements:
        for pos in positions:
            if pos in measurement:
                value = parse_value(measurement[pos])
                sums[pos] += value
                counts[pos] += 1

    averages = {}
    for pos in positions:
        if counts[pos] > 0:
            averages[pos] = sums[pos] / counts[pos]
        else:
            averages[pos] = 0.0

    overall = sum(averages.values()) / len(averages) if averages else 0.0
    return averages, overall

def main():
    # Process all frames
    results = []
    for frame_name in sorted(frames_data.keys()):
        measurements = frames_data[frame_name]
        averages, overall = calculate_averages(measurements)

        results.append({
            'frame': frame_name,
            'A': averages['A'],
            'B': averages['B'],
            'C': averages['C'],
            'D': averages['D'],
            'E': averages['E'],
            'overall': overall
        })

    # Print results
    print("=" * 90)
    print("FRAME MEASUREMENT AVERAGES - ALL POSITIONS")
    print("=" * 90)
    print(f"{'Frame Number':<17} {'A':>9} {'B':>9} {'C':>9} {'D':>9} {'E':>9} {'Overall':>9}")
    print("-" * 90)

    for result in results:
        print(f"{result['frame']:<17} {result['A']:>9.3f} {result['B']:>9.3f} {result['C']:>9.3f} {result['D']:>9.3f} {result['E']:>9.3f} {result['overall']:>9.3f}")

    print("=" * 90)
    print(f"Total frames processed: {len(results)}")
    print("=" * 90)

if __name__ == "__main__":
    main()
