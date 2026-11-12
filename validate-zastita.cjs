// Checks zastita.json before it is published. Run: node validate-zastita.cjs [previous.json]
// The rules match plantValidateFeed() in the Jato app (plants-model.js): an invalid file is ignored by the app.
const fs = require("fs");
const CROPS = ["apple", "pear", "plum", "peach", "apricot", "cherry", "sourcherry", "walnut", "hazel", "grape", "olive", "other"];
const COUNTIES = [
  "zagrebacka", "krapinsko-zagorska", "sisacko-moslavacka", "karlovacka", "varazdinska", "koprivnicko-krizevacka",
  "bjelovarsko-bilogorska", "primorsko-goranska", "licko-senjska", "viroviticko-podravska", "pozesko-slavonska",
  "brodsko-posavska", "zadarska", "osjecko-baranjska", "sibensko-kninska", "vukovarsko-srijemska",
  "splitsko-dalmatinska", "istarska", "dubrovacko-neretvanska", "medimurska", "grad-zagreb",
];
const fail = (m) => {
  console.error("GREŠKA: " + m);
  process.exit(1);
};
const day = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const md = (v) => typeof v === "string" && /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(v);
const text = (v, max) => typeof v === "string" && v.trim().length > 0 && v.length <= max;
const f = JSON.parse(fs.readFileSync(__dirname + "/zastita.json", "utf8"));
if (f.format !== "jato-zastita-1") fail("format mora biti jato-zastita-1");
if (!Number.isInteger(f.version) || f.version < 1) fail("version mora biti cijeli broj ≥ 1");
if (!day(f.updated)) fail("updated mora biti datum GGGG-MM-DD");
if (!Array.isArray(f.items) || f.items.length > 500) fail("items: najviše 500 obavijesti");
const ids = new Set();
for (const i of f.items) {
  const where = "obavijest " + (i && i.id);
  if (!/^[a-z0-9-]{3,80}$/.test(i.id || "")) fail(where + ": id samo mala slova, brojke i crtice");
  if (ids.has(i.id)) fail(where + ": ponovljen id");
  ids.add(i.id);
  if (!Number.isInteger(i.added) || i.added < 1 || i.added > f.version) fail(where + ": added između 1 i version");
  if (!day(i.date)) fail(where + ": date");
  if (!["notice", "calendar"].includes(i.kind)) fail(where + ": kind notice | calendar");
  if (!text(i.title, 120)) fail(where + ": title do 120 znakova");
  if (!text(i.summary, 800)) fail(where + ": summary do 800 znakova");
  if (!Array.isArray(i.regions) || !i.regions.length || i.regions.some((r) => r !== "all" && !COUNTIES.includes(r)))
    fail(where + ": regions (all ili oznake županija)");
  if (!Array.isArray(i.crops) || i.crops.some((c) => !CROPS.includes(c))) fail(where + ": crops (prazno = sve kulture)");
  if (!Array.isArray(i.targets) || i.targets.length > 12 || i.targets.some((t) => !text(t, 120))) fail(where + ": targets");
  if (!Array.isArray(i.products) || i.products.length > 12 || i.products.some((x) => !x || !text(x.name, 80) || (x.note !== undefined && !text(x.note, 160))))
    fail(where + ": products (samo kako ih navodi izvor)");
  if (i.kind === "calendar" && (!md(i.from) || !md(i.to))) fail(where + ": kalendar treba from i to (MM-DD)");
  if (i.kind === "notice" && (i.from !== undefined || i.to !== undefined)) fail(where + ": obavijest nema from/to");
  if (!Array.isArray(i.sources) || i.sources.length < 1 || i.sources.length > 5) fail(where + ": 1–5 izvora");
  for (const s of i.sources) {
    if (!text(s.title, 120)) fail(where + ": naslov izvora");
    if (!/^https:\/\/[^\s"'<>]+$/.test(s.url || "") || s.url.length > 400) fail(where + ": izvor mora biti https poveznica");
  }
}
if (process.argv[2] && fs.existsSync(process.argv[2])) {
  const old = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  if (JSON.stringify(old) !== JSON.stringify(f)) {
    if (f.version <= old.version) fail("pri svakoj izmjeni povećajte version (bilo " + old.version + ")");
    for (const o of old.items) if (!ids.has(o.id)) fail("obavijest " + o.id + " je obrisana; zastarjele označite u summary, ne brišite");
    for (const i of f.items) {
      const o = old.items.find((x) => x.id === i.id);
      if (!o && i.added !== f.version) fail("nova obavijest " + i.id + " mora imati added = " + f.version);
      if (o && o.added !== i.added) fail("obavijest " + i.id + ": added se ne mijenja");
    }
  }
}
console.log(`PASS zastita.json: verzija ${f.version}, ${f.items.length} obavijesti`);
