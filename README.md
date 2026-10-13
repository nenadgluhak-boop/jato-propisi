# Jato · novosti o propisima

Javna datoteka [`propisi.json`](propisi.json) s promjenama propisa važnim za OPG s peradi u Hrvatskoj. Aplikacija **Jato** je provjerava na gumb i jednom dnevno u pozadini, a za nove stavke šalje obavijest. U datoteci su samo informacije o propisima, bez korisničkih podataka.

- Novosti priprema tjedna AI provjera prema [uputama](UPUTE-ZA-PROVJERU.md) i otvara pull request s izvorima.
- Vlasnik pregledava i spaja. Tek objava na grani `main` stiže do korisnika.
- `validate.cjs` provjerava format pri svakom pull requestu (GitHub Actions): verzija mora rasti, a novosti se ne brišu.

Format `jato-propisi-1`:

```json
{
  "format": "jato-propisi-1",
  "version": 2,
  "updated": "2026-10-20",
  "items": [
    {
      "id": "primjer-novosti",
      "added": 2,
      "date": "2027-01-01",
      "severity": "deadline",
      "title": "Kratak naslov",
      "summary": "Što se mijenja, za koga, od kada i što napraviti.",
      "affects": ["fiscal"],
      "sources": [{ "title": "NN …", "url": "https://narodne-novine.nn.hr/…" }]
    }
  ]
}
```

Informativni pregled, nije pravni savjet.
