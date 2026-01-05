#!/usr/bin/env python3
"""
Complete Frame Analysis - Berekent gemiddelden voor alle frames
Voeg alle frame data toe aan het frames_dict
"""

def parse_value(v):
    """Parse value string to float"""
    v = str(v).strip()
    # Remove + sign
    if v.startswith('+'): v = v[1:]
    # Handle special negatives
    if v.startswith('_'): v = '-' + v[1:]
    if v.startswith('+-') or v.startswith('-+'): v = '-' + v[2:]
    # Replace comma with dot
    v = v.replace(',', '.')
    # Handle special chars
    v = v.replace('0.', '0.')  # Already correct
    try:
        return float(v)
    except:
        return 0.0

# VOEG HIER ALLE FRAMES TOE
# Formaat: "FRAME_ID": [{"A":"waarde", "B":"waarde", ...}, ... 26 metingen total]
frames_dict = {
    # Top 10 frames als voorbeeld
    "ML251-B583": [
        {"A":"+1,56","B":"+1,63","C":"+1,64","D":"+1,69","E":"+1,42"},
        {"A":"+1,36","B":"+1,20","C":"+1,47","D":"+1,50","E":"+1,49"},
        {"A":"+1,06","B":"+0,91","C":"+1,44","D":"+1,61","E":"+1,44"},
        {"A":"+1,14","B":"+1,16","C":"+1,40","D":"+1,34","E":"+1,43"},
        {"A":"+0,94","B":"+1,16","C":"+1,59","D":"+1,61","E":"+1,28"},
        {"A":"+0,87","B":"+1,02","C":"+1,21","D":"+1,37","E":"+1,36"},
        {"A":"+1,14","B":"+1,27","C":"+1,47","D":"+1,38","E":"+1,26"},
        {"A":"+1,26","B":"+1,38","C":"+1,71","D":"+1,68","E":"+1,28"},
        {"A":"+1,20","B":"+1,46","C":"+1,74","D":"+1,98","E":"+1,69"},
        {"A":"+1,11","B":"+1,56","C":"+1,66","D":"+1,96","E":"+1,70"},
        {"A":"+1,18","B":"+1,66","C":"+1,69","D":"+1,88","E":"+1,44"},
        {"A":"+0,99","B":"+1,50","C":"+1,81","D":"+1,30","E":"+1,25"},
        {"A":"+1,64","B":"+1,72","C":"+1,32","D":"+1,46","E":"+1,56"},
        {"A":"+1,51","B":"+1,59","C":"+1,07","D":"+1,60","E":"+1,27"},
        {"A":"+1,00","B":"+1,25","C":"+1,84","D":"+1,39","E":"+1,37"},
        {"A":"+0,69","B":"+0,82","C":"+1,38","D":"+1,72","E":"+1,64"},
        {"A":"+1,03","B":"+1,27","C":"+1,56","D":"+1,79","E":"+1,45"},
        {"A":"+0,96","B":"+1,41","C":"+1,56","D":"+1,83","E":"+1,33"},
        {"A":"+1,09","B":"+1,22","C":"+1,32","D":"+1,63","E":"+1,42"},
        {"A":"+1,18","B":"+1,13","C":"+1,55","D":"+1,62","E":"+1,27"},
        {"A":"+0,60","B":"+0,85","C":"+1,29","D":"+1,36","E":"+1,12"},
        {"A":"+1,16","B":"+1,29","C":"+1,49","D":"+1,42","E":"+1,22"},
        {"A":"+1,07","B":"+1,16","C":"+1,53","D":"+1,44","E":"+1,05"},
        {"A":"+1,33","B":"+1,27","C":"+1,44","D":"+1,36","E":"+1,39"},
        {"A":"+0,76","B":"+1,27","C":"+1,61","D":"+1,68","E":"+1,61"},
        {"A":"+1,62","B":"+1,59","C":"+1,96","D":"+1,86","E":"+1,39"}
    ],

    # Voeg hier meer frames toe met dezelfde structuur...
    # Bijvoorbeeld:
    # "ML251-B064": [...26 metingen...],
    # "ML251-B482": [...26 metingen...],
    # etc.
}

def calculate_frame_averages(measurements):
    """Bereken gemiddelde per positie (A-E) over alle metingen"""
    positions = ['A', 'B', 'C', 'D', 'E']
    sums = {p: 0.0 for p in positions}
    counts = {p: 0 for p in positions}

    for meting in measurements:
        for pos in positions:
            if pos in meting:
                val = parse_value(meting[pos])
                sums[pos] += val
                counts[pos] += 1

    avgs = {}
    for pos in positions:
        avgs[pos] = sums[pos] / counts[pos] if counts[pos] > 0 else 0.0

    overall = sum(avgs.values()) / len(avgs)
    return avgs, overall

def main():
    print("=" * 100)
    print("FRAME METINGEN - GEMIDDELDE WAARDEN PER POSITIE")
    print("=" * 100)
    print(f"{'Frame Nummer':<18} {'Gem A':>10} {'Gem B':>10} {'Gem C':>10} {'Gem D':>10} {'Gem E':>10} {'Overall':>10}")
    print("-" * 100)

    results = []
    for frame_id in sorted(frames_dict.keys()):
        avgs, overall = calculate_frame_averages(frames_dict[frame_id])
        results.append({
            'id': frame_id,
            'A': avgs['A'],
            'B': avgs['B'],
            'C': avgs['C'],
            'D': avgs['D'],
            'E': avgs['E'],
            'overall': overall
        })
        print(f"{frame_id:<18} {avgs['A']:>10.3f} {avgs['B']:>10.3f} {avgs['C']:>10.3f} {avgs['D']:>10.3f} {avgs['E']:>10.3f} {overall:>10.3f}")

    print("=" * 100)
    print(f"Totaal aantal frames verwerkt: {len(results)}")
    print("=" * 100)

    # Statistieken
    if results:
        print("\nGLOBALE STATISTIEKEN (over alle frames):")
        print("-" * 100)
        avg_of_A = sum(r['A'] for r in results) / len(results)
        avg_of_B = sum(r['B'] for r in results) / len(results)
        avg_of_C = sum(r['C'] for r in results) / len(results)
        avg_of_D = sum(r['D'] for r in results) / len(results)
        avg_of_E = sum(r['E'] for r in results) / len(results)
        avg_overall = sum(r['overall'] for r in results) / len(results)

        print(f"Gemiddelde van alle A waarden: {avg_of_A:.3f}")
        print(f"Gemiddelde van alle B waarden: {avg_of_B:.3f}")
        print(f"Gemiddelde van alle C waarden: {avg_of_C:.3f}")
        print(f"Gemiddelde van alle D waarden: {avg_of_D:.3f}")
        print(f"Gemiddelde van alle E waarden: {avg_of_E:.3f}")
        print(f"Totaal gemiddelde:              {avg_overall:.3f}")
        print("=" * 100)

if __name__ == "__main__":
    main()
