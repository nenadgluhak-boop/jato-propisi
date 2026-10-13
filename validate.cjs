// Checks propisi.json before it is published. Run: node validate.cjs [previous.json]
// The rules match validateRulesFeed() in the Jato app (legal-guide.js): an invalid file is ignored by the app.
const fs = require("fs");
const GUIDE_IDS = [
  "opg", "tax", "insurance", "farmreg", "vet", "carcass", "eggreg", "slaughterreg", "fiscal",
  "house", "origin", "vaccination", "welfare", "broilers", "bio250",
  "daily", "report", "medrecords", "dead",
  "withdrawal", "slaughter", "labels", "salesrec",
  "clean", "manure", "archive",
  "naredba", "nd", "water", "taxyear",
];
const fail = (m) => {
  console.error("GREŠKA: " + m);
  process.exit(1);
};
const day = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const text = (v, max) => typeof v === "string" && v.trim().length > 0 && v.length <= max;

const f = JSON.parse(fs.readFileSync(__dirname + "/propisi.json", "utf8"));
if (f.format !== "jato-propisi-1") fail("format mora biti jato-propisi-1");
if (!Number.isInteger(f.version) || f.version < 1) fail("version mora biti cijeli broj ≥ 1");
if (!day(f.updated)) fail("updated mora biti datum GGGG-MM-DD");
if (!Array.isArray(f.items) || f.items.length > 300) fail("items: najviše 300 novosti");
const ids = new Set();
for (const i of f.items) {
  const where = "novost " + (i && i.id);
  if (!/^[a-z0-9-]{3,60}$/.test(i.id || "")) fail(where + ": id samo mala slova, brojke i crtice");
  if (ids.has(i.id)) fail(where + ": ponovljen id");
  ids.add(i.id);
  if (!day(i.date)) fail(where + ": date");
  if (!text(i.title, 120)) fail(where + ": title do 120 znakova");
  if (!text(i.summary, 800)) fail(where + ": summary do 800 znakova");
  if (!["info", "change", "deadline"].includes(i.severity)) fail(where + ": severity info | change | deadline");
  if (!Number.isInteger(i.added) || i.added < 1 || i.added > f.version) fail(where + ": added između 1 i version");
  for (const a of i.affects || []) if (!GUIDE_IDS.includes(a)) fail(where + ": nepoznata točka vodiča " + a);
  if (!Array.isArray(i.sources) || i.sources.length < 1 || i.sources.length > 5) fail(where + ": 1–5 izvora");
  for (const s of i.sources) {
    if (!text(s.title, 120)) fail(where + ": naslov izvora");
    if (!/^https:\/\/[^\s"'<>]+$/.test(s.url || "") || s.url.length > 400) fail(where + ": izvor mora biti https poveznica");
  }
}
// Compared with the published file: version must grow and nothing may disappear.
if (process.argv[2] && fs.existsSync(process.argv[2])) {
  const old = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  if (JSON.stringify(old) !== JSON.stringify(f)) {
    if (f.version <= old.version) fail("pri svakoj izmjeni povećajte version (bilo " + old.version + ")");
    for (const o of old.items) if (!ids.has(o.id)) fail("novost " + o.id + " je obrisana; zastarjele označite u summary, ne brišite");
    for (const i of f.items) {
      const o = old.items.find((x) => x.id === i.id);
      if (!o && i.added !== f.version) fail("nova novost " + i.id + " mora imati added = " + f.version);
      if (o && o.added !== i.added) fail("novost " + i.id + ": added se ne mijenja");
    }
  }
}
console.log(`PASS propisi.json: verzija ${f.version}, ${f.items.length} novosti`);
