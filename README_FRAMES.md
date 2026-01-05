# Frame Measurements Analysis

## Samenvatting

Dit script berekent de gemiddelde waarden per positie (A, B, C, D, E) voor alle frames over 26 meetpunten.

## Hoe te gebruiken

### Stap 1: Open het script
```bash
nano analyze_all_frames.py
```

### Stap 2: Voeg frame data toe
Voeg je frames toe in de `raw_data` variabele in dit formaat:

```
FRAME_ID:[{JSON array met alle metingen}]
```

**Voorbeeld:**
```
ML251-B583:[{"A":"+1,56","B":"+1,63","C":"+1,64","D":"+1,69","E":"+1,42"}, ... ]
```

### Stap 3: Voer het script uit
```bash
python3 analyze_all_frames.py
```

## Output

Het script geeft:
- **Tabel** met gemiddelden per frame voor positie A, B, C, D, E
- **Overall gemiddelde** per frame
- **Aantal metingen** per frame (moet 26 zijn)
- **Globale statistieken** over alle frames

## Voorbeeld Output

```
==============================================================================================================
FRAME METINGEN - GEMIDDELDE WAARDEN PER POSITIE
==============================================================================================================
Frame                    Gem A       Gem B       Gem C       Gem D       Gem E     Overall  #Metingen
--------------------------------------------------------------------------------------------------------------
ML251-B064               0.877       0.958       1.442       1.157       0.799       1.046         26
ML251-B482               0.648       0.524       0.834       0.570       0.576       0.630         26
ML251-B583               1.133       1.298       1.529       1.595       1.390       1.389         26
==============================================================================================================
```

## Data Formaat

### Belangrijk:
- Elk frame heeft **exact 26 metingen**
- Elke meting heeft 5 waarden: A, B, C, D, E
- Waarden gebruiken **komma** als decimaalteken ("+1,56")
- Script herkent ook speciale formats zoals: "_0,13", "+-0,03", "0.42"

### Om al je frames toe te voegen:

1. Kopieer de tabel data uit je oorspronkelijke bericht
2. Voor elk frame, converteer de rij naar formaat:
   ```
   FRAME_ID:[{metingen als JSON array}]
   ```
3. Plak alle regels in de `raw_data` string in het script

## Snelle Conversie Tool

Als je hulp nodig hebt bij het converteren van je tabel naar het juiste formaat, kun je dit kleine helper script gebruiken:

```python
# Plak je tabel regel hier en converteer naar juiste formaat
# Voorbeeld: zie convert_table_to_json.py
```

## Contact

Bij vragen of problemen, controleer:
1. Of elk frame exact 26 metingen heeft
2. Of de JSON syntax klopt (gebruik een JSON validator)
3. Of er geen speciale karakters zijn die problemen geven

## Huidige Status

✅ Script werkt correct
✅ Parse functie handelt alle number formats af
✅ Berekeningen zijn correct
⚠️  **Actie vereist**: Voeg alle frame data toe aan raw_data variabele

---
*Laatste update: 2026-01-05*
