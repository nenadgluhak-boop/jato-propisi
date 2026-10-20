# Provjera izdanja 2 · 20. listopada 2026.

Informativni sažeci za korisnike, nisu pravni savjet. Četiri prethodna ID-a i njihove oznake `added: 1` ostaju sačuvani; nova stavka ima `added: 2`. Povučene tvrdnje izričito su ispravljene u sažecima. Format ostaje `jato-propisi-1`, objavljena verzija raste s 1 na 2.

## Provjera pet stavki

| Stavka | Nalaz i postupak |
|---|---|
| Veterinarski lijekovi | Razdvojeni opći početak primjene i odgođena obveza veterinara za elektronički upis. Nije navedeno da držatelj mora sam unositi podatke u državnu bazu. |
| eRačun | Precizirani porezni obveznici i transakcije; razdvojeno zaprimanje od izdavanja. Povučena kategorična tvrdnja o računima i otkupnom bloku. |
| Fiskalizacija | Razdvojeni krajnja potrošnja, eRačuni i izuzeće OPG-a. Povučena opća zabrana Worda, Excela i rukom pisanih računa. |
| Mali objekti | Razlikuju se odobrena mala klaonica i registrirani objekt na gospodarstvu podrijetla. Dodani rok usklađivanja i zakonski izuzetak. |
| Influenca | Potvrđena primjena izmjene iz 2024. i aktualna potvrda Ministarstva. Zabrana površinske vode precizirana prema pristupu divljih ptica. Datum zapisa ostaje datum objave; početak primjene naveden je u sažetku. |

Službeni izvori (puni tekstovi i prijelazne odredbe):

- [NN 69/2026](https://narodne-novine.nn.hr/clanci/sluzbeni/2026_06_69_831.html), čl. 7., 77., 78. i 142.
- [NN 89/2025](https://narodne-novine.nn.hr/clanci/sluzbeni/2025_06_89_1233.html), čl. 3., 4., 22., 23., 38.–41. i 80.; [Porezna: B2C](https://porezna-uprava.gov.hr/hr/fiskalizacija-racuna-u-krajnjoj-potrosnji-b2c-poslovanje/8033); [Porezna: eRačuni](https://porezna-uprava.gov.hr/hr/izdavatelji-i-primatelji-eracuna-te-obveza-izdavanja-eracuna-azurirano-7-11-2025/8048).
- [NN 65/2025](https://narodne-novine.nn.hr/clanci/sluzbeni/2025_04_65_850.html), čl. 6., 17. i 20.; [NN 123/2019](https://narodne-novine.nn.hr/clanci/sluzbeni/2019_12_123_2434.html), čl. 3. i 17.; [izmjena NN 3/2021](https://narodne-novine.nn.hr/clanci/sluzbeni/2021_01_3_60.html).
- [NN 138/2023](https://narodne-novine.nn.hr/clanci/sluzbeni/2023_11_138_1881.html), čl. 1.–3., 5. i 7.; [NN 55/2024](https://narodne-novine.nn.hr/clanci/sluzbeni/2024_05_55_971.html); [aktualna stranica Ministarstva](https://veterinarstvo.mps.hr/hr/naslovna/influenca-ptica/).

## Validacija i Jato 1.14.0

- `node validate.cjs old.json`: PASS, verzija 2, pet stavki; usporedba s v1 (commit `01b5526aec98ec1f4902fb33ac84e08cb50b608d`).
- Testiran neizmijenjeni `web.html` Jata 1.14.0 iz repozitorija `puran`, commit `b099b74071b2393d630ce27bb48f1ff87634a7cb`.
- `verify-jato114.cjs`: PASS, Chromium headless shell, 393 × 852. Provjereni stvarni predloženi JSON, prijelaz v1→v2, svih pet tekstova, napomena o pravnom savjetu, pamćenje pregledanog izdanja, odbijanje starije/neispravne datoteke te simulirani Android most, pozadinski cache i otvaranje novosti iz obavijesti.
- Pregledan `RulesCheck.java` iste verzije: obavijest jednom za izdanje s novim nepročitanim stavkama, uz uključenu automatsku provjeru i dopuštene obavijesti. Prvo pozadinsko preuzimanje nakon instalacije namjerno ne šalje obavijest.
- Korisnik koji je pregledao v1 dobiva **jednu novu stavku** (lijekovi); četiri ispravka ostaju pod postojećim novostima, bez dodatnih oznaka Novo. Najstarija novost dostupna je pod **Sve novosti (5)**. Ispravak influence nema novu oznaku uz vodič jer `rulesFor` izdvaja samo zapise iz posljednjih 365 dana i buduće rokove.
- Ovo nije potvrda dostave sistemske obavijesti na fizičkom telefonu. Androidova približno dnevna provjera ovisi o sustavu. Ručna provjera: **Više → Novosti o propisima → Provjeri novosti**.
- Ugrađeni vodič u APK-u feedom se ne mijenja: ispravci su u novostima. Njegova ranija formulacija o elektroničkoj evidenciji traži trajni ispravak u budućem APK-u; ova novost navodi preciznije datume.

Ponovljiva provjera: dohvatite navedeni `web.html` kroz odobren pristup repozitoriju, spremite v1 kao `old.json`, osigurajte Playwright i Chromium:

```sh
node validate.cjs old.json
CHROME_PATH=/path/to/chromium node verify-jato114.cjs /path/to/Jato-1.14.0/web.html
```
