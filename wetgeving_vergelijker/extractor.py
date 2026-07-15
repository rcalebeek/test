"""Tekst uit een PDF halen, met behoud van paginanummers.

De rest van het programma werkt met een lijst van (paginanummer, tekst) zodat
we bij elke wijziging kunnen tonen op welke pagina die staat.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Pagina:
    """Eén pagina uit een PDF."""

    nummer: int  # 1-gebaseerd, zoals een mens telt
    tekst: str


def extract_paginas(pdf_pad: str) -> list[Pagina]:
    """Lees een PDF en geef per pagina de platte tekst terug.

    Vereist PyMuPDF (``pip install pymupdf``).
    """
    try:
        import fitz  # PyMuPDF
    except ImportError as exc:  # pragma: no cover - afhankelijkheid ontbreekt
        raise ImportError(
            "PyMuPDF is niet geïnstalleerd. Draai eerst: pip install pymupdf"
        ) from exc

    paginas: list[Pagina] = []
    with fitz.open(pdf_pad) as doc:
        for index, blad in enumerate(doc, start=1):
            # "text" geeft de leesvolgorde-tekst; goed genoeg voor wetgeving.
            tekst = blad.get_text("text")
            paginas.append(Pagina(nummer=index, tekst=tekst))
    return paginas


def paginas_naar_regels(paginas: list[Pagina]) -> list[tuple[int, str]]:
    """Zet pagina's om naar een platte lijst van (paginanummer, regel).

    Lege regels worden weggelaten en witruimte wordt genormaliseerd, zodat
    verschillen in opmaak (dubbele spaties, afbreekstreepjes) niet als een
    inhoudelijke wijziging worden gezien.
    """
    regels: list[tuple[int, str]] = []
    for pagina in paginas:
        for ruwe_regel in pagina.tekst.splitlines():
            regel = " ".join(ruwe_regel.split())
            if regel:
                regels.append((pagina.nummer, regel))
    return regels
