#!/usr/bin/env python3
"""Wetgeving-vergelijker — CLI.

Vergelijkt twee versies van een wetgevings-PDF en schrijft een HTML-rapport
met de wijzigingen per artikel/sectie, inclusief paginaverwijzing.

Gebruik:
    python vergelijk.py oude_versie.pdf nieuwe_versie.pdf
    python vergelijk.py oud.pdf nieuw.pdf -o rapport.html --titel "Verordening 2018/858"
"""

from __future__ import annotations

import argparse
import sys
import webbrowser
from pathlib import Path

from wetgeving_vergelijker import (
    extract_paginas,
    genereer_html_rapport,
    splits_in_secties,
    vergelijk_documenten,
)
from wetgeving_vergelijker.vergelijk import GEWIJZIGD, NIEUW, VERWIJDERD, samenvatting


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Vergelijk twee versies van een wetgevings-PDF."
    )
    parser.add_argument("oud", help="PDF van de oude / vorige versie")
    parser.add_argument("nieuw", help="PDF van de nieuwe versie")
    parser.add_argument(
        "-o", "--output", default="wetgeving_vergelijking.html",
        help="Pad voor het HTML-rapport (standaard: wetgeving_vergelijking.html)",
    )
    parser.add_argument(
        "--titel", default="Wetgeving-vergelijking", help="Titel bovenaan het rapport"
    )
    parser.add_argument(
        "--open", action="store_true", help="Open het rapport na afloop in de browser"
    )
    args = parser.parse_args(argv)

    for pad in (args.oud, args.nieuw):
        if not Path(pad).is_file():
            print(f"Bestand niet gevonden: {pad}", file=sys.stderr)
            return 1

    print(f"Inlezen oude versie:  {args.oud}")
    oud_secties = splits_in_secties(extract_paginas(args.oud))
    print(f"  → {len(oud_secties)} secties gevonden")

    print(f"Inlezen nieuwe versie: {args.nieuw}")
    nieuw_secties = splits_in_secties(extract_paginas(args.nieuw))
    print(f"  → {len(nieuw_secties)} secties gevonden")

    vergelijkingen = vergelijk_documenten(oud_secties, nieuw_secties)
    telling = samenvatting(vergelijkingen)

    print("\nResultaat:")
    print(f"  gewijzigd  : {telling[GEWIJZIGD]}")
    print(f"  nieuw      : {telling[NIEUW]}")
    print(f"  verwijderd : {telling[VERWIJDERD]}")

    html = genereer_html_rapport(
        vergelijkingen,
        oud_naam=Path(args.oud).name,
        nieuw_naam=Path(args.nieuw).name,
        titel=args.titel,
    )
    Path(args.output).write_text(html, encoding="utf-8")
    print(f"\nRapport geschreven naar: {args.output}")

    if args.open:
        webbrowser.open(Path(args.output).resolve().as_uri())

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
