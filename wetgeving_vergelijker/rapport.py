"""HTML-rapport genereren uit de vergelijking."""

from __future__ import annotations

import datetime as _dt

from jinja2 import Environment

from .vergelijk import (
    GEWIJZIGD,
    NIEUW,
    ONGEWIJZIGD,
    VERWIJDERD,
    SectieVergelijking,
    samenvatting,
)

_TEMPLATE = """<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{ titel }}</title>
<style>
  :root {
    --bg: #f5f6f8; --kaart: #ffffff; --tekst: #1c2530; --zacht: #64748b;
    --rand: #e2e8f0; --accent: #1d4ed8;
    --wijz: #b45309; --wijz-bg: #fef3c7; --nieuw: #047857; --nieuw-bg: #d1fae5;
    --weg: #b91c1c; --weg-bg: #fee2e2; --bij-bg: #dcfce7;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0f172a; --kaart: #1e293b; --tekst: #e2e8f0; --zacht: #94a3b8;
      --rand: #334155; --accent: #60a5fa;
      --wijz: #fbbf24; --wijz-bg: #422006; --nieuw: #34d399; --nieuw-bg: #052e1b;
      --weg: #f87171; --weg-bg: #450a0a; --bij-bg: #052e16;
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--tekst);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5; }
  .wrap { max-width: 960px; margin: 0 auto; padding: 32px 20px 80px; }
  header h1 { margin: 0 0 4px; font-size: 1.5rem; }
  header .sub { color: var(--zacht); font-size: .9rem; }
  .docs { display: flex; flex-wrap: wrap; gap: 12px; margin: 20px 0; }
  .doc { flex: 1 1 220px; background: var(--kaart); border: 1px solid var(--rand);
    border-radius: 10px; padding: 12px 14px; font-size: .85rem; }
  .doc .rol { color: var(--zacht); text-transform: uppercase; letter-spacing: .05em;
    font-size: .7rem; }
  .doc .naam { font-weight: 600; word-break: break-word; }
  .tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px; margin: 8px 0 28px; }
  .tile { background: var(--kaart); border: 1px solid var(--rand); border-radius: 10px;
    padding: 14px 16px; }
  .tile .n { font-size: 1.8rem; font-weight: 700; }
  .tile .l { color: var(--zacht); font-size: .8rem; }
  .tile.gewijzigd .n { color: var(--wijz); }
  .tile.nieuw .n { color: var(--nieuw); }
  .tile.verwijderd .n { color: var(--weg); }
  section.sectie { background: var(--kaart); border: 1px solid var(--rand);
    border-radius: 12px; margin: 0 0 16px; overflow: hidden; }
  .kop { display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    padding: 14px 18px; border-bottom: 1px solid var(--rand); }
  .kop h2 { margin: 0; font-size: 1.05rem; flex: 1 1 auto; }
  .badge { font-size: .72rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .04em; padding: 3px 9px; border-radius: 999px; white-space: nowrap; }
  .badge.gewijzigd { color: var(--wijz); background: var(--wijz-bg); }
  .badge.nieuw { color: var(--nieuw); background: var(--nieuw-bg); }
  .badge.verwijderd { color: var(--weg); background: var(--weg-bg); }
  .paginas { color: var(--zacht); font-size: .8rem; white-space: nowrap; }
  .diff { margin: 0; padding: 6px 0; font-size: .9rem;
    font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace; }
  .diff .r { padding: 2px 18px; white-space: pre-wrap; word-break: break-word; }
  .diff .context { color: var(--zacht); }
  .diff .inkorting { color: var(--zacht); font-style: italic; font-family: system-ui, sans-serif; }
  .diff .verwijderd { background: var(--weg-bg); }
  .diff .verwijderd::before { content: "− "; color: var(--weg); }
  .diff .toegevoegd { background: var(--bij-bg); }
  .diff .toegevoegd::before { content: "+ "; color: var(--nieuw); }
  ins { background: var(--bij-bg); color: var(--nieuw); text-decoration: none;
    border-radius: 3px; padding: 0 2px; }
  del { background: var(--weg-bg); color: var(--weg); border-radius: 3px; padding: 0 2px; }
  .body-tekst { padding: 6px 18px 14px; font-size: .9rem; white-space: pre-wrap;
    word-break: break-word; color: var(--tekst); }
  .leeg { color: var(--zacht); font-style: italic; padding: 8px 0 0; }
  footer { color: var(--zacht); font-size: .78rem; margin-top: 40px;
    border-top: 1px solid var(--rand); padding-top: 16px; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>{{ titel }}</h1>
    <div class="sub">Automatische vergelijking · gegenereerd op {{ datum }}</div>
  </header>

  <div class="docs">
    <div class="doc"><div class="rol">Oude versie</div><div class="naam">{{ oud_naam }}</div></div>
    <div class="doc"><div class="rol">Nieuwe versie</div><div class="naam">{{ nieuw_naam }}</div></div>
  </div>

  <div class="tiles">
    <div class="tile gewijzigd"><div class="n">{{ telling[GEWIJZIGD] }}</div><div class="l">gewijzigd</div></div>
    <div class="tile nieuw"><div class="n">{{ telling[NIEUW] }}</div><div class="l">nieuw</div></div>
    <div class="tile verwijderd"><div class="n">{{ telling[VERWIJDERD] }}</div><div class="l">verwijderd</div></div>
    <div class="tile"><div class="n">{{ telling[ONGEWIJZIGD] }}</div><div class="l">ongewijzigd</div></div>
  </div>

  {% if not gewijzigde_secties %}
    <p class="leeg">Er zijn geen inhoudelijke verschillen gevonden tussen de twee documenten.</p>
  {% endif %}

  {% for v in gewijzigde_secties %}
  <section class="sectie">
    <div class="kop">
      <h2>{{ v.titel }}</h2>
      <span class="badge {{ v.status }}">{{ v.status }}</span>
      <span class="paginas">{{ v.paginas_label }}</span>
    </div>
    {% if v.status == GEWIJZIGD %}
      <div class="diff">
        {% for regel in v.diff %}
          {% if regel.soort == 'wijziging' %}
            <div class="r wijziging">{% for deel in regel.woord_delen %}{% if deel.mark == 'weg' %}<del>{{ deel.tekst }}</del>{% elif deel.mark == 'bij' %}<ins>{{ deel.tekst }}</ins>{% else %}{{ deel.tekst }}{% endif %} {% endfor %}</div>
          {% else %}
            <div class="r {{ regel.soort }}">{{ regel.tekst }}</div>
          {% endif %}
        {% endfor %}
      </div>
    {% elif v.status == NIEUW %}
      <div class="body-tekst">{{ v.nieuw.tekst if v.nieuw.tekst else '(geen tekst)' }}</div>
    {% elif v.status == VERWIJDERD %}
      <div class="body-tekst">{{ v.oud.tekst if v.oud.tekst else '(geen tekst)' }}</div>
    {% endif %}
  </section>
  {% endfor %}

  <footer>
    Wetgeving-vergelijker · Hestcon. Dit rapport is een hulpmiddel: controleer
    wijzigingen altijd tegen de bronteksten. De genoemde pagina's verwijzen naar
    de betreffende PDF-versie.
  </footer>
</div>
</body>
</html>
"""


def genereer_html_rapport(
    vergelijkingen: list[SectieVergelijking],
    oud_naam: str,
    nieuw_naam: str,
    titel: str = "Wetgeving-vergelijking",
) -> str:
    """Bouw het volledige HTML-rapport als string."""
    env = Environment(autoescape=True)
    template = env.from_string(_TEMPLATE)

    gewijzigde_secties = [
        v for v in vergelijkingen if v.status in (GEWIJZIGD, NIEUW, VERWIJDERD)
    ]

    return template.render(
        titel=titel,
        datum=_dt.date.today().strftime("%d-%m-%Y"),
        oud_naam=oud_naam,
        nieuw_naam=nieuw_naam,
        telling=samenvatting(vergelijkingen),
        gewijzigde_secties=gewijzigde_secties,
        GEWIJZIGD=GEWIJZIGD,
        NIEUW=NIEUW,
        VERWIJDERD=VERWIJDERD,
        ONGEWIJZIGD=ONGEWIJZIGD,
    )
