"""Twee sets secties tegen elkaar afzetten en de wijzigingen bepalen."""

from __future__ import annotations

import difflib
from dataclasses import dataclass, field

from .structuur import Sectie

# Statussen die een sectie kan hebben na vergelijking.
ONGEWIJZIGD = "ongewijzigd"
GEWIJZIGD = "gewijzigd"
NIEUW = "nieuw"
VERWIJDERD = "verwijderd"


@dataclass
class WoordDeel:
    """Een stukje van een gewijzigde regel voor inline-markering."""

    mark: str  # "gelijk" | "weg" | "bij"
    tekst: str


@dataclass
class DiffRegel:
    """Eén regel in het verschil-overzicht van een sectie."""

    soort: str  # "context" | "verwijderd" | "toegevoegd" | "wijziging" | "inkorting"
    tekst: str = ""
    woord_delen: list[WoordDeel] = field(default_factory=list)


@dataclass
class SectieVergelijking:
    """Resultaat van het vergelijken van één sectie tussen oud en nieuw."""

    sleutel: str
    titel: str
    status: str
    oud: Sectie | None = None
    nieuw: Sectie | None = None
    diff: list[DiffRegel] = field(default_factory=list)

    @property
    def paginas_label(self) -> str:
        if self.status == VERWIJDERD and self.oud is not None:
            return f"oud {self.oud.paginas_label}"
        if self.status == NIEUW and self.nieuw is not None:
            return f"nieuw {self.nieuw.paginas_label}"
        delen = []
        if self.oud is not None:
            delen.append(f"oud {self.oud.paginas_label}")
        if self.nieuw is not None:
            delen.append(f"nieuw {self.nieuw.paginas_label}")
        return " · ".join(delen) if delen else "-"


def _woord_diff(oud_regel: str, nieuw_regel: str) -> list[WoordDeel]:
    """Bepaal het verschil tussen twee regels op woordniveau."""
    oud_woorden = oud_regel.split()
    nieuw_woorden = nieuw_regel.split()
    matcher = difflib.SequenceMatcher(a=oud_woorden, b=nieuw_woorden, autojunk=False)
    delen: list[WoordDeel] = []
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            delen.append(WoordDeel("gelijk", " ".join(oud_woorden[i1:i2])))
        else:
            if i2 > i1:
                delen.append(WoordDeel("weg", " ".join(oud_woorden[i1:i2])))
            if j2 > j1:
                delen.append(WoordDeel("bij", " ".join(nieuw_woorden[j1:j2])))
    return delen


def _bouw_diff(oud: Sectie, nieuw: Sectie, context: int = 1) -> list[DiffRegel]:
    """Maak een leesbaar regel-diff met beperkte context rond wijzigingen."""
    matcher = difflib.SequenceMatcher(a=oud.regels, b=nieuw.regels, autojunk=False)
    resultaat: list[DiffRegel] = []

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            blok = oud.regels[i1:i2]
            if len(blok) <= context * 2:
                for regel in blok:
                    resultaat.append(DiffRegel("context", tekst=regel))
            else:
                for regel in blok[:context]:
                    resultaat.append(DiffRegel("context", tekst=regel))
                weggelaten = len(blok) - context * 2
                resultaat.append(
                    DiffRegel("inkorting", tekst=f"… {weggelaten} ongewijzigde regel(s) …")
                )
                for regel in blok[-context:]:
                    resultaat.append(DiffRegel("context", tekst=regel))
        elif tag == "replace":
            oud_blok = oud.regels[i1:i2]
            nieuw_blok = nieuw.regels[j1:j2]
            if len(oud_blok) == len(nieuw_blok):
                for oud_regel, nieuw_regel in zip(oud_blok, nieuw_blok):
                    resultaat.append(
                        DiffRegel("wijziging", woord_delen=_woord_diff(oud_regel, nieuw_regel))
                    )
            else:
                for regel in oud_blok:
                    resultaat.append(DiffRegel("verwijderd", tekst=regel))
                for regel in nieuw_blok:
                    resultaat.append(DiffRegel("toegevoegd", tekst=regel))
        elif tag == "delete":
            for regel in oud.regels[i1:i2]:
                resultaat.append(DiffRegel("verwijderd", tekst=regel))
        elif tag == "insert":
            for regel in nieuw.regels[j1:j2]:
                resultaat.append(DiffRegel("toegevoegd", tekst=regel))

    return resultaat


def vergelijk_documenten(
    oud_secties: list[Sectie], nieuw_secties: list[Sectie]
) -> list[SectieVergelijking]:
    """Vergelijk twee documenten sectie voor sectie.

    De volgorde van het resultaat volgt het nieuwe document; secties die alleen
    in het oude document staan (verwijderd) worden achteraan toegevoegd.
    """
    oud_index = {s.sleutel: s for s in oud_secties}
    nieuw_index = {s.sleutel: s for s in nieuw_secties}

    resultaat: list[SectieVergelijking] = []

    for sectie in nieuw_secties:
        oud_sectie = oud_index.get(sectie.sleutel)
        if oud_sectie is None:
            resultaat.append(
                SectieVergelijking(
                    sleutel=sectie.sleutel,
                    titel=sectie.titel,
                    status=NIEUW,
                    nieuw=sectie,
                )
            )
        elif oud_sectie.regels == sectie.regels:
            resultaat.append(
                SectieVergelijking(
                    sleutel=sectie.sleutel,
                    titel=sectie.titel,
                    status=ONGEWIJZIGD,
                    oud=oud_sectie,
                    nieuw=sectie,
                )
            )
        else:
            resultaat.append(
                SectieVergelijking(
                    sleutel=sectie.sleutel,
                    titel=sectie.titel,
                    status=GEWIJZIGD,
                    oud=oud_sectie,
                    nieuw=sectie,
                    diff=_bouw_diff(oud_sectie, sectie),
                )
            )

    for sectie in oud_secties:
        if sectie.sleutel not in nieuw_index:
            resultaat.append(
                SectieVergelijking(
                    sleutel=sectie.sleutel,
                    titel=sectie.titel,
                    status=VERWIJDERD,
                    oud=sectie,
                )
            )

    return resultaat


def samenvatting(vergelijkingen: list[SectieVergelijking]) -> dict[str, int]:
    """Tel de statussen voor het overzicht bovenaan het rapport."""
    telling = {ONGEWIJZIGD: 0, GEWIJZIGD: 0, NIEUW: 0, VERWIJDERD: 0}
    for vergelijking in vergelijkingen:
        telling[vergelijking.status] += 1
    return telling
