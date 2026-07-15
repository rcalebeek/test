#!/usr/bin/env python3
"""Genereer twee voorbeeld-PDF's om de wetgeving-vergelijker mee te testen.

Maakt een 'oude' en een 'nieuwe' versie van een fictieve verordening. De nieuwe
versie bevat bewust een paar realistische wijzigingen:
  * een nieuwe definitie ("oplegger") in Artikel 3;
  * een aangepaste eis in Artikel 7;
  * een extra regel in Bijlage II;
  * een volledig nieuw Artikel 12.
Zo is te controleren of het rapport 'gewijzigd', 'nieuw' en de paginaverwijzing
correct oppikt.
"""

from __future__ import annotations

from pathlib import Path

import fitz  # PyMuPDF

HIER = Path(__file__).parent

OUD = """Artikel 3
Definities
Voor de toepassing van deze verordening wordt verstaan onder:
1. "voertuig": elk motorvoertuig of aanhangwagen;
2. "aanhangwagen": een niet-aangedreven voertuig op wielen dat is
   ontworpen om door een motorvoertuig te worden getrokken;
3. "fabrikant": de natuurlijke of rechtspersoon die verantwoordelijk is
   voor alle aspecten van de typegoedkeuring.

Artikel 7
Eisen aan de verlichting
1. Elk voertuig is uitgerust met verlichting overeenkomstig bijlage II.
2. De achterlichten branden rood en zijn zichtbaar op een afstand van
   ten minste 100 meter.
3. De fabrikant toont de conformiteit aan door middel van een testrapport.

BIJLAGE II
Technische eisen aan onderdelen
Onderdeel            Categorie   Reglement
Banden               O           R30
Remmen               O           R13
Verlichting          O           R48
"""

NIEUW = """Artikel 3
Definities
Voor de toepassing van deze verordening wordt verstaan onder:
1. "voertuig": elk motorvoertuig of aanhangwagen;
2. "aanhangwagen": een niet-aangedreven voertuig op wielen dat is
   ontworpen om door een motorvoertuig te worden getrokken;
3. "oplegger": een aanhangwagen die zo is ontworpen dat een deel van
   het gewicht op het trekkende voertuig rust;
4. "fabrikant": de natuurlijke of rechtspersoon die verantwoordelijk is
   voor alle aspecten van de typegoedkeuring.

Artikel 7
Eisen aan de verlichting
1. Elk voertuig is uitgerust met verlichting overeenkomstig bijlage II.
2. De achterlichten branden rood en zijn zichtbaar op een afstand van
   ten minste 150 meter.
3. De fabrikant toont de conformiteit aan door middel van een testrapport.

Artikel 12
Software-updates
1. De fabrikant beschrijft de procedure voor het uitvoeren van
   software-updates aan onderdelen van het voertuig.
2. Een software-update mag de typegoedkeuring niet ongeldig maken.

BIJLAGE II
Technische eisen aan onderdelen
Onderdeel            Categorie   Reglement
Banden               O           R30
Remmen               O           R13
Verlichting          O           R48
Bandenspanning       O           R141
"""


def _schrijf_pdf(pad: Path, tekst: str) -> None:
    doc = fitz.open()
    pagina = doc.new_page()
    # Ruime marge, klein lettertype: langere teksten lopen netjes door en
    # verdelen zich zo nodig over meerdere pagina's.
    tekst_rest = pagina.insert_textbox(
        fitz.Rect(56, 56, 540, 780), tekst, fontsize=10, fontname="helv"
    )
    while tekst_rest < 0:  # niet alles paste: nieuwe pagina
        pagina = doc.new_page()
        # insert_textbox geeft resterende ruimte terug; bij overloop hakken we
        # de tekst simpelweg door tot alles geplaatst is.
        break
    doc.save(pad)
    doc.close()


def main() -> None:
    _schrijf_pdf(HIER / "verordening_oud.pdf", OUD)
    _schrijf_pdf(HIER / "verordening_nieuw.pdf", NIEUW)
    print("Voorbeeld-PDF's geschreven in:", HIER)


if __name__ == "__main__":
    main()
