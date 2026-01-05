#!/usr/bin/env python3
"""
Frame Measurements Analysis Tool
Berekent gemiddelde waarden per positie (A, B, C, D, E) voor alle frames

INSTRUCTIES:
1. Voeg alle frame data toe aan de raw_data string hieronder
2. Formaat per regel: FRAME_ID:[{JSON array met 26 metingen}]
3. Voer het script uit: python3 analyze_all_frames.py
"""

import json

def parse_value(v):
    """Convert measurement string to float"""
    v = str(v).strip().lstrip('+')
    if v.startswith('_'): v = '-' + v[1:]
    if v.startswith('+-') or v.startswith('-+'): v = '-' + v[2:]
    v = v.replace(',', '.')
    try:
        return float(v)
    except:
        return 0.0

# VOEG HIER ALLE FRAME DATA TOE
# Elke regel: FRAME_ID:[{...26 metingen...}]
raw_data = """
ML251-B583:[{"A":"+1,56","B":"+1,63","C":"+1,64","D":"+1,69","E":"+1,42"},{"A":"+1,36","B":"+1,20","C":"+1,47","D":"+1,50","E":"+1,49"},{"A":"+1,06","B":"+0,91","C":"+1,44","D":"+1,61","E":"+1,44"},{"A":"+1,14","B":"+1,16","C":"+1,40","D":"+1,34","E":"+1,43"},{"A":"+0,94","B":"+1,16","C":"+1,59","D":"+1,61","E":"+1,28"},{"A":"+0,87","B":"+1,02","C":"+1,21","D":"+1,37","E":"+1,36"},{"A":"+1,14","B":"+1,27","C":"+1,47","D":"+1,38","E":"+1,26"},{"A":"+1,26","B":"+1,38","C":"+1,71","D":"+1,68","E":"+1,28"},{"A":"+1,20","B":"+1,46","C":"+1,74","D":"+1,98","E":"+1,69"},{"A":"+1,11","B":"+1,56","C":"+1,66","D":"+1,96","E":"+1,70"},{"A":"+1,18","B":"+1,66","C":"+1,69","D":"+1,88","E":"+1,44"},{"A":"+0,99","B":"+1,50","C":"+1,81","D":"+1,30","E":"+1,25"},{"A":"+1,64","B":"+1,72","C":"+1,32","D":"+1,46","E":"+1,56"},{"A":"+1,51","B":"+1,59","C":"+1,07","D":"+1,60","E":"+1,27"},{"A":"+1,00","B":"+1,25","C":"+1,84","D":"+1,39","E":"+1,37"},{"A":"+0,69","B":"+0,82","C":"+1,38","D":"+1,72","E":"+1,64"},{"A":"+1,03","B":"+1,27","C":"+1,56","D":"+1,79","E":"+1,45"},{"A":"+0,96","B":"+1,41","C":"+1,56","D":"+1,83","E":"+1,33"},{"A":"+1,09","B":"+1,22","C":"+1,32","D":"+1,63","E":"+1,42"},{"A":"+1,18","B":"+1,13","C":"+1,55","D":"+1,62","E":"+1,27"},{"A":"+0,60","B":"+0,85","C":"+1,29","D":"+1,36","E":"+1,12"},{"A":"+1,16","B":"+1,29","C":"+1,49","D":"+1,42","E":"+1,22"},{"A":"+1,07","B":"+1,16","C":"+1,53","D":"+1,44","E":"+1,05"},{"A":"+1,33","B":"+1,27","C":"+1,44","D":"+1,36","E":"+1,39"},{"A":"+0,76","B":"+1,27","C":"+1,61","D":"+1,68","E":"+1,61"},{"A":"+1,62","B":"+1,59","C":"+1,96","D":"+1,86","E":"+1,39"}]
ML251-B064:[{"A":"+1,01","B":"+1,22","C":"+1,55","D":"+1,38","E":"+0,77"},{"A":"+0,82","B":"+0,84","C":"+1,42","D":"+1,38","E":"+1,18"},{"A":"+0,73","B":"+0,83","C":"+1,27","D":"+1,14","E":"+0,51"},{"A":"+0,91","B":"+0,75","C":"+1,32","D":"+0,96","E":"+0,65"},{"A":"+0,82","B":"+0,85","C":"+1,45","D":"+1,04","E":"+0,85"},{"A":"+0,79","B":"+0,99","C":"+1,28","D":"+0,93","E":"+0,79"},{"A":"+0,86","B":"+1,11","C":"+1,54","D":"+1,22","E":"+0,99"},{"A":"+0,83","B":"+1,06","C":"+1,59","D":"+1,17","E":"+0,84"},{"A":"+1,08","B":"+1,37","C":"+1,77","D":"+1,34","E":"+0,97"},{"A":"+0,86","B":"+1,10","C":"+1,77","D":"+1,32","E":"+0,88"},{"A":"+1,06","B":"+1,12","C":"+1,55","D":"+1,19","E":"+0,93"},{"A":"+1,13","B":"+1,27","C":"+1,77","D":"+1,16","E":"+1,07"},{"A":"+1,04","B":"+1,28","C":"+1,08","D":"+0,92","E":"+0,30"},{"A":"+0,99","B":"+0,55","C":"+0,74","D":"+0,83","E":"+0,48"},{"A":"+0,81","B":"+0,92","C":"+1,57","D":"+1,11","E":"+0,72"},{"A":"+0,92","B":"+0,94","C":"+1,52","D":"+1,15","E":"+1,06"},{"A":"+0,86","B":"+0,68","C":"+1,46","D":"+1,34","E":"+0,91"},{"A":"+0,85","B":"+0,99","C":"+1,47","D":"+1,45","E":"+0,98"},{"A":"+0,70","B":"+0,88","C":"+1,53","D":"+1,30","E":"+0,91"},{"A":"+0,74","B":"+0,71","C":"+1,29","D":"+0,99","E":"+0,38"},{"A":"+0,76","B":"+0,90","C":"+1,51","D":"+1,20","E":"+0,67"},{"A":"+0,57","B":"+0,79","C":"+1,26","D":"+1,00","E":"+0,70"},{"A":"+0,81","B":"+0,79","C":"+1,32","D":"+0,99","E":"+0,62"},{"A":"+0,78","B":"+0,78","C":"+1,18","D":"+0,86","E":"+0,58"},{"A":"+0,75","B":"+0,88","C":"+1,31","D":"+1,06","E":"+0,87"},{"A":"+1,32","B":"+1,30","C":"+1,97","D":"+1,65","E":"+1,16"}]
ML251-B482:[{"A":"+0,46","B":"+0,40","C":"+0,66","D":"+0,47","E":"+0,35"},{"A":"+0,32","B":"+0,29","C":"+0,68","D":"+0,44","E":"+0,69"},{"A":"+0,51","B":"+0,34","C":"+0,75","D":"+0,54","E":"+0,58"},{"A":"+0,77","B":"+0,49","C":"+0,87","D":"+0,49","E":"+0,65"},{"A":"+1,24","B":"+1,12","C":"+0,99","D":"+0,49","E":"+0,59"},{"A":"+0,86","B":"+0,60","C":"+1,13","D":"+0,63","E":"+0,77"},{"A":"+0,99","B":"+0,73","C":"+0,95","D":"+0,47","E":"+0,37"},{"A":"+0,64","B":"+0,46","C":"+0,97","D":"+0,62","E":"+0,66"},{"A":"+0,90","B":"+0,71","C":"+0,77","D":"+0,49","E":"+0,41"},{"A":"+0,56","B":"+0,61","C":"+1,00","D":"+0,78","E":"+0,65"},{"A":"+0,82","B":"+0,83","C":"+1,07","D":"+0,72","E":"+0,65"},{"A":"+0,51","B":"+0,48","C":"+0,89","D":"+0,59","E":"+0,76"},{"A":"+0,60","B":"+0,54","C":"+0,30","D":"+0,54","E":"+0,67"},{"A":"+0,31","B":"+0,45","C":"+0,74","D":"+0,59","E":"+0,52"},{"A":"+0,91","B":"+0,85","C":"+1,37","D":"+1,11","E":"+0,96"},{"A":"+0,53","B":"+0,41","C":"+0,76","D":"+0,74","E":"+0,74"},{"A":"+0,78","B":"+0,63","C":"+0,79","D":"+0,93","E":"+1,12"},{"A":"+0,66","B":"+0,66","C":"+0,71","D":"+0,61","E":"+0,39"},{"A":"+0,57","B":"+0,45","C":"+0,82","D":"+0,54","E":"+0,49"},{"A":"+0,62","B":"+0,26","C":"+0,56","D":"+0,33","E":"+0,20"},{"A":"+0,50","B":"+0,31","C":"+0,61","D":"+0,48","E":"+0,49"},{"A":"+0,51","B":"+0,27","C":"+0,67","D":"+0,28","E":"+0,19"},{"A":"+0,62","B":"+0,13","C":"+0,53","D":"+0,17","E":"+0,20"},{"A":"+0,22","B":"+0,03","C":"+0,56","D":"+0,06","E":"+0,08"},{"A":"+0,51","B":"+0,46","C":"+0,91","D":"+0,50","E":"+0,61"},{"A":"+0,92","B":"+1,11","C":"+1,63","D":"+1,21","E":"+1,19"}]
""".strip()

# ADD MORE FRAMES HERE...
# Copy paste your table data in the same format

def process_frames():
    results = []
    errors = []

    for line_num, line in enumerate(raw_data.split('\n'), 1):
        if not line.strip() or ':' not in line:
            continue

        try:
            frame_id, json_data = line.split(':', 1)
            measurements = json.loads(json_data)

            # Calculate averages per position
            sums = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0}
            counts = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0}

            for measurement in measurements:
                for pos in ['A', 'B', 'C', 'D', 'E']:
                    if pos in measurement:
                        value = parse_value(measurement[pos])
                        sums[pos] += value
                        counts[pos] += 1

            avgs = {pos: sums[pos]/counts[pos] if counts[pos] > 0 else 0
                    for pos in ['A', 'B', 'C', 'D', 'E']}
            overall = sum(avgs.values()) / 5

            results.append({
                'frame': frame_id,
                'A': avgs['A'],
                'B': avgs['B'],
                'C': avgs['C'],
                'D': avgs['D'],
                'E': avgs['E'],
                'overall': overall,
                'n_measurements': len(measurements)
            })

        except Exception as e:
            errors.append(f"Regel {line_num}: {str(e)[:50]}")

    return results, errors

def print_results(results, errors):
    # Print errors if any
    if errors:
        print("\nWAARSCHUWINGEN:")
        for err in errors:
            print(f"  - {err}")
        print()

    # Print table header
    print("=" * 110)
    print("FRAME METINGEN - GEMIDDELDE WAARDEN PER POSITIE")
    print("=" * 110)
    print(f"{'Frame':<18} {'Gem A':>11} {'Gem B':>11} {'Gem C':>11} {'Gem D':>11} {'Gem E':>11} {'Overall':>11} {'#Metingen':>10}")
    print("-" * 110)

    # Print sorted results
    for r in sorted(results, key=lambda x: x['frame']):
        print(f"{r['frame']:<18} {r['A']:>11.3f} {r['B']:>11.3f} {r['C']:>11.3f} {r['D']:>11.3f} {r['E']:>11.3f} {r['overall']:>11.3f} {r['n_measurements']:>10}")

    print("=" * 110)
    print(f"Totaal aantal frames: {len(results)}")
    print("=" * 110)

    # Print statistics
    if results:
        print("\nGLOBALE STATISTIEKEN:")
        print("-" * 110)
        avg_A = sum(r['A'] for r in results) / len(results)
        avg_B = sum(r['B'] for r in results) / len(results)
        avg_C = sum(r['C'] for r in results) / len(results)
        avg_D = sum(r['D'] for r in results) / len(results)
        avg_E = sum(r['E'] for r in results) / len(results)
        avg_total = sum(r['overall'] for r in results) / len(results)

        print(f"Gemiddelde van alle A waarden:  {avg_A:>8.3f}")
        print(f"Gemiddelde van alle B waarden:  {avg_B:>8.3f}")
        print(f"Gemiddelde van alle C waarden:  {avg_C:>8.3f}")
        print(f"Gemiddelde van alle D waarden:  {avg_D:>8.3f}")
        print(f"Gemiddelde van alle E waarden:  {avg_E:>8.3f}")
        print(f"Totaal gemiddelde:               {avg_total:>8.3f}")
        print("=" * 110)

if __name__ == "__main__":
    results, errors = process_frames()
    print_results(results, errors)
