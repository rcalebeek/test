"""Wetgeving-vergelijker voor Hestcon.

Vergelijkt twee versies van een wetgevings-PDF (bijv. een oude en een nieuwe
geconsolideerde versie van een EU-verordening) en maakt de wijzigingen per
artikel/sectie inzichtelijk, met paginaverwijzing naar beide documenten.
"""

from .extractor import extract_paginas
from .structuur import splits_in_secties, Sectie
from .vergelijk import vergelijk_documenten, SectieVergelijking
from .rapport import genereer_html_rapport

__all__ = [
    "extract_paginas",
    "splits_in_secties",
    "Sectie",
    "vergelijk_documenten",
    "SectieVergelijking",
    "genereer_html_rapport",
]
