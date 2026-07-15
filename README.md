# Wetgeving-vergelijker — Hestcon

Een klein programma dat **twee versies van een wetgevings-PDF** (bijvoorbeeld een
oude en een nieuwe geconsolideerde versie van een EU-verordening op EUR-Lex)
naast elkaar legt en de **wijzigingen per artikel/sectie** laat zien, met
**paginaverwijzing** naar beide documenten.

Bedoeld als hulpmiddel voor het monitoren van wetgeving: in plaats van twee PDF's
handmatig regel voor regel te vergelijken, krijg je een overzichtelijk rapport
met wat er is gewijzigd, toegevoegd of verwijderd.

## Wat het doet

- Leest beide PDF's in en houdt bij op welke pagina elke tekst staat.
- Knipt de tekst op langs de wettelijke structuur (`Artikel`, `HOOFDSTUK`,
  `BIJLAGE`, `Aanhangsel` — Nederlands, met Engelse/UNECE-varianten als reserve).
- Vergelijkt elke sectie en bepaalt of die **ongewijzigd**, **gewijzigd**,
  **nieuw** of **verwijderd** is.
- Bij gewijzigde secties markeert het de verschillen tot op **woordniveau**.
- Schrijft een overzichtelijk **HTML-rapport** dat je in elke browser opent.

> Let op: dit is een hulpmiddel. Controleer belangrijke wijzigingen altijd tegen
> de bronteksten. Het programma leest de tekst uit de PDF; bij gescande
> (niet-doorzoekbare) PDF's is er geen tekstlaag om te vergelijken.

## Installatie

Vereist Python 3.10 of hoger.

```bash
pip install -r requirements.txt
```

## Gebruik

```bash
python vergelijk.py OUDE_VERSIE.pdf NIEUWE_VERSIE.pdf
```

Opties:

| Optie            | Betekenis                                              |
|------------------|--------------------------------------------------------|
| `-o RAPPORT.html`| Waar het rapport wordt opgeslagen                      |
| `--titel "..."`  | Titel bovenaan het rapport                             |
| `--open`         | Open het rapport meteen in je browser                  |

Voorbeeld:

```bash
python vergelijk.py verordening_2018-858_v5.pdf verordening_2018-858_v6.pdf \
    -o vergelijking_2018-858.html --titel "Verordening 2018/858 — M5 vs M6" --open
```

## Even zelf uitproberen (zonder echte PDF's)

Er zit een voorbeeld bij dat twee fictieve versies van een verordening genereert
met een paar realistische wijzigingen (een toegevoegde definitie "oplegger", een
gewijzigde eis, een nieuwe bijlage-regel en een nieuw artikel):

```bash
python voorbeeld/maak_voorbeeld_pdfs.py
python vergelijk.py voorbeeld/verordening_oud.pdf voorbeeld/verordening_nieuw.pdf \
    -o voorbeeld/rapport.html
```

Open daarna `voorbeeld/rapport.html` in je browser.

## Hoe het in elkaar zit

```
vergelijk.py                     CLI: leest de PDF's in en schrijft het rapport
wetgeving_vergelijker/
├── extractor.py                 PDF → tekst per pagina
├── structuur.py                 tekst → secties (artikelen, bijlagen, ...)
├── vergelijk.py                 secties oud vs. nieuw → wijzigingen + woord-diff
└── rapport.py                   wijzigingen → HTML-rapport
voorbeeld/                       voorbeeld-PDF's om mee te testen
```

## Verder bouwen

Logische vervolgstappen die passen bij het proces bij Hestcon:

- Een **klantvriendelijke samenvatting** in nieuwsbrief-stijl ("Let op: de
  wetgeving is gewijzigd, dit betekent voor u…") automatisch uit het rapport
  genereren.
- De EUR-Lex- en UNECE-structuur dieper volgen (verwijzingen naar
  deelreglementen zoals R30, R13 automatisch oppakken).
- Koppelen aan de bestaande Hestcon-tool zodat een geconstateerde wijziging
  direct als concept (geel vlaggetje) bij de betreffende typegoedkeuring landt.
