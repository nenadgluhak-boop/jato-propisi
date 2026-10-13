# Upute za tjednu provjeru propisa

Ove upute slijedi zakazana AI provjera (i svatko tko ručno dopunjuje novosti). Aplikacija Jato čita samo `propisi.json` s grane `main`. Svaka izmjena ide preko pull requesta koji vlasnik pregleda i spoji. Tek tada korisnici dobivaju obavijest.

## Što se prati

Obveze OPG-a s peradi u Hrvatskoj, prema točkama vodiča u aplikaciji (`affects`):

| Područje | Točke vodiča | Gdje provjeriti |
|---|---|---|
| Zdravlje životinja, influenca ptica, cijepljenje, godišnja naredba | `house`, `origin`, `report`, `vaccination`, `nd`, `naredba`, `bio250`, `water` | narodne-novine.nn.hr, veterinarstvo.mps.hr, poljoprivreda.gov.hr |
| Dobrobit (nesilice, tovni pilići) | `welfare`, `broilers`, `daily` | narodne-novine.nn.hr, eur-lex.europa.eu |
| Registracija objekata, klanje, jaja, označavanje | `farmreg`, `eggreg`, `slaughterreg`, `slaughter`, `labels` | narodne-novine.nn.hr, zakon.hr, hpa.mps.hr |
| Lijekovi, karenca, nusproizvodi i uginuća | `medrecords`, `withdrawal`, `carcass`, `dead` | eur-lex.europa.eu, veterinarstvo.mps.hr |
| Porez, računi, fiskalizacija, eRačun | `tax`, `fiscal`, `salesrec`, `taxyear` | porezna-uprava.gov.hr, narodne-novine.nn.hr, fiskalopedija.hr |
| Upis OPG-a, osiguranje | `opg`, `insurance` | apprrr.hr, narodne-novine.nn.hr |
| Gnoj, okoliš | `manure`, `clean` | narodne-novine.nn.hr, mingor.gov.hr |

## Pravila

1. **Samo provjerljive promjene.** Svaka novost ima barem jedan izvor, po mogućnosti službeni: Narodne novine, ministarstvo ili EUR-Lex. Stručni portal je dopušten uz službeni izvor kad postoji. Nema nagađanja ni najava bez izvora.
2. **Bez dupliciranja.** Ako novost s istim sadržajem već postoji, ne dodaje se.
3. **Ništa se ne briše.** Novost koja je zastarjela ostaje, a u `summary` se dopiše što je zamijenjeno i čime. `id` i `added` se ne mijenjaju.
4. **Verzija.** Kod svake izmjene `version` se poveća za 1, `updated` dobije današnji datum, a svaka nova novost dobije `added` = nova verzija.
5. **Polja nove novosti:**
   - `id`: mala slova, brojke i crtice, npr. `naredba-zdravlje-zivotinja-2027`,
   - `date`: datum stupanja na snagu ili objave,
   - `severity`:
     - `deadline` za rok koji tek dolazi,
     - `change` za promijenjenu obvezu,
     - `info` za pojašnjenje,
   - `title`: do 120 znakova,
   - `summary`: do 800 znakova. Hrvatski, kratko i praktično: što se mijenja, za koga, od kada i što OPG treba napraviti,
   - `affects`: točke vodiča iz tablice,
   - `sources`: 1–5 poveznica `https://`.
6. **Provjera.** `node validate.cjs staro.json`, gdje je `staro.json` datoteka s grane `main`, mora proći prije otvaranja pull requesta.
7. **Pull request.** Naslov „Propisi: <kratko>”. U opisu je popis novosti s izvorima i kratko obrazloženje zašto je svaka bitna za OPG s peradi. Ako nema novosti, pull request se ne otvara.

Ovo je informativni pregled za korisnike, a ne pravni savjet. Aplikacija to navodi uz svaku novost.
