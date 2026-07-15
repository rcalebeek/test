"""Tests voor de structuur- en vergelijk-logica (zonder PDF's nodig)."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from wetgeving_vergelijker.extractor import Pagina
from wetgeving_vergelijker.structuur import splits_in_secties
from wetgeving_vergelijker.vergelijk import (
    GEWIJZIGD,
    NIEUW,
    ONGEWIJZIGD,
    VERWIJDERD,
    vergelijk_documenten,
    samenvatting,
)

DOC_OUD = [Pagina(1, "Artikel 1\nEerste regel.\n\nArtikel 2\nOngewijzigd.\n")]
DOC_NIEUW = [Pagina(1, "Artikel 1\nEerste regel gewijzigd.\n\nArtikel 2\nOngewijzigd.\n\nArtikel 3\nNieuw artikel.\n")]


def test_secties_worden_herkend():
    secties = splits_in_secties(DOC_OUD)
    sleutels = [s.sleutel for s in secties]
    assert "artikel 1" in sleutels
    assert "artikel 2" in sleutels


def test_paginanummer_wordt_bewaard():
    secties = splits_in_secties(DOC_OUD)
    assert all(s.start_pagina == 1 for s in secties)


def test_statussen_kloppen():
    resultaat = vergelijk_documenten(splits_in_secties(DOC_OUD), splits_in_secties(DOC_NIEUW))
    per_sleutel = {v.sleutel: v.status for v in resultaat}
    assert per_sleutel["artikel 1"] == GEWIJZIGD
    assert per_sleutel["artikel 2"] == ONGEWIJZIGD
    assert per_sleutel["artikel 3"] == NIEUW


def test_verwijderde_sectie():
    resultaat = vergelijk_documenten(splits_in_secties(DOC_NIEUW), splits_in_secties(DOC_OUD))
    per_sleutel = {v.sleutel: v.status for v in resultaat}
    assert per_sleutel["artikel 3"] == VERWIJDERD


def test_samenvatting_telt_alles():
    resultaat = vergelijk_documenten(splits_in_secties(DOC_OUD), splits_in_secties(DOC_NIEUW))
    telling = samenvatting(resultaat)
    assert telling[GEWIJZIGD] == 1
    assert telling[NIEUW] == 1
    assert telling[ONGEWIJZIGD] == 1
    assert telling[VERWIJDERD] == 0


if __name__ == "__main__":
    import subprocess

    raise SystemExit(subprocess.call([sys.executable, "-m", "pytest", __file__, "-v"]))
