"""Wettekst opdelen in logische secties (artikelen, hoofdstukken, bijlagen).

EU-verordeningen op EUR-Lex hebben een vaste structuur. Door de tekst op te
knippen langs die koppen kunnen we per artikel/bijlage vergelijken in plaats van
de hele PDF als één brok. Dat maakt de wijzigingen veel beter leesbaar.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

from .extractor import Pagina, paginas_naar_regels

# Regels die als een nieuwe sectie-kop gelden. Nederlands (EUR-Lex) staat
# voorop; Engelse/UNECE-varianten staan erbij zodat ook die documenten werken.
KOP_PATRONEN: list[re.Pattern] = [
    re.compile(r"^HOOFDSTUK\s+[IVXLCDM0-9]+", re.IGNORECASE),
    re.compile(r"^CHAPTER\s+[IVXLCDM0-9]+", re.IGNORECASE),
    re.compile(r"^Artikel\s+\d+[a-z]?(\s+(bis|ter|quater))?", re.IGNORECASE),
    re.compile(r"^Article\s+\d+[a-z]?", re.IGNORECASE),
    re.compile(r"^BIJLAGE\s*[IVXLCDM0-9]*", re.IGNORECASE),
    re.compile(r"^ANNEX\s*[IVXLCDM0-9]*", re.IGNORECASE),
    re.compile(r"^Aanhangsel\s*\d*", re.IGNORECASE),
    re.compile(r"^Appendix\s*\d*", re.IGNORECASE),
]


@dataclass
class Sectie:
    """Eén logische eenheid uit de wettekst."""

    sleutel: str  # genormaliseerde sleutel om secties te matchen ("artikel 3")
    titel: str  # de kop zoals hij in het document staat ("Artikel 3")
    regels: list[str] = field(default_factory=list)
    start_pagina: int | None = None
    eind_pagina: int | None = None

    @property
    def tekst(self) -> str:
        return "\n".join(self.regels)

    @property
    def paginas_label(self) -> str:
        if self.start_pagina is None:
            return "-"
        if self.eind_pagina and self.eind_pagina != self.start_pagina:
            return f"p. {self.start_pagina}–{self.eind_pagina}"
        return f"p. {self.start_pagina}"


def _is_kop(regel: str) -> bool:
    return any(patroon.match(regel) for patroon in KOP_PATRONEN)


def _normaliseer_sleutel(kop: str) -> str:
    """Maak een stabiele sleutel van een kopregel.

    "Artikel 3 bis"  -> "artikel 3 bis"
    "BIJLAGE  II"    -> "bijlage ii"
    """
    sleutel = " ".join(kop.split()).lower()
    sleutel = sleutel.rstrip(".:;,")
    return sleutel


def splits_in_secties(paginas: list[Pagina]) -> list[Sectie]:
    """Splits de pagina's van een document in secties op basis van de koppen."""
    regels = paginas_naar_regels(paginas)

    secties: list[Sectie] = []
    gebruikte_sleutels: dict[str, int] = {}

    # Alles vóór de eerste kop valt onder "Aanhef".
    huidige = Sectie(sleutel="aanhef", titel="Aanhef / preambule")

    def sluit_af(sectie: Sectie) -> None:
        if sectie.regels or sectie.sleutel != "aanhef":
            secties.append(sectie)

    for pagina, regel in regels:
        if _is_kop(regel):
            sluit_af(huidige)

            basis_sleutel = _normaliseer_sleutel(regel)
            # Voorkom botsingen als dezelfde kop twee keer voorkomt.
            aantal = gebruikte_sleutels.get(basis_sleutel, 0)
            gebruikte_sleutels[basis_sleutel] = aantal + 1
            sleutel = basis_sleutel if aantal == 0 else f"{basis_sleutel} #{aantal + 1}"

            huidige = Sectie(sleutel=sleutel, titel=regel)
            huidige.start_pagina = pagina
            huidige.eind_pagina = pagina
        else:
            if huidige.start_pagina is None:
                huidige.start_pagina = pagina
            huidige.eind_pagina = pagina
            huidige.regels.append(regel)

    sluit_af(huidige)
    return secties
