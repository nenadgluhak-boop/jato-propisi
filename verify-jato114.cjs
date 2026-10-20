// Usage: node verify-jato114.cjs /path/to/Jato-1.14.0/web.html
// Runs the unchanged 1.14.0 interface with the proposed feed and a cached v1.
// Requires Playwright and CHROME_PATH (or a Playwright-managed browser).
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const { chromium } = require("playwright");
const feed = JSON.parse(fs.readFileSync(path.join(__dirname, "propisi.json"), "utf8"));
const old = JSON.parse(fs.readFileSync(process.env.PREVIOUS_FEED || path.join(__dirname, "old.json"), "utf8"));
const web = path.resolve(process.argv[2]);
const html = fs.readFileSync(web, "utf8");
const script = id => html.match(new RegExp('<script id="' + id + '">([\\s\\S]*?)</script>'))[1];
const pure = vm.createContext({ TextEncoder });
vm.runInContext(["model", "husbandry", "farm-model", "legal-guide"].map(script).join("\n") +
  "\nglobalThis.r={validateRulesFeed,rulesNew,rulesFor,RULES_URL};", pure);
assert.equal(pure.r.validateRulesFeed(feed).version, 2);
assert.deepEqual(Array.from(pure.r.rulesNew(feed, 1), x => x.id), ["zakon-veterinarski-lijekovi-nn69-2026"]);
assert.equal(pure.r.rulesNew(feed, 2).length, 0);
assert.equal(pure.r.rulesNew(feed, 0).length, 5);
for (const i of old.items) {
  const next = feed.items.find(x => x.id === i.id);
  assert.ok(next, i.id);
  assert.equal(next.added, i.added);
}
const seed = JSON.stringify({version:1,batches:[],events:[]});
(async () => {
  const browser = await chromium.launch({headless:true, executablePath:process.env.CHROME_PATH, args:["--no-sandbox"]});
  try {
    const context = await browser.newContext({viewport:{width:393,height:852}});
    let payload = JSON.stringify(feed), requests = 0;
    await context.route(pure.r.RULES_URL, route => {requests++; return route.fulfill({status:200,contentType:"application/json",body:payload,headers:{"access-control-allow-origin":"*"}});});
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.addInitScript(([s, f]) => {
      if (!localStorage.getItem("puran.v1")) localStorage.setItem("puran.v1", s);
      if (!localStorage.getItem("puran.rules")) localStorage.setItem("puran.rules", JSON.stringify({feed:f,seen:1,auto:true,checkedAt:"2026-10-19T10:00:00Z"}));
    }, [seed,old]);
    await page.goto("file://" + web);
    await page.locator("nav [data-page=more]").click();
    await page.locator("main#app [data-opg-tab=rules]").click();
    await page.locator("#rulesCheck").click();
    await page.waitForFunction(() => document.querySelector("#rulesCard")?.textContent.includes("izdanje 2"));
    assert.equal(requests,1);
    assert.match(await page.locator("#toast").textContent(), /Novosti o propisima: 1/);
    assert.equal(await page.locator("#rulesCard .rules-item").count(),5);
    assert.equal(await page.locator("#rulesCard .rules-item .rules-new").count(),1);
    const content = await page.locator("#rulesCard").textContent();
    for (const i of feed.items) assert.ok(content.includes(i.summary), i.id);
    assert.ok(content.includes("nije pravni savjet"));
    assert.ok(content.includes("Sve novosti (5)"));
    const fiscal = page.locator(".rules-item").filter({hasText:feed.items[2].title});
    assert.ok((await fiscal.textContent()).includes("Povučena je ranija opća tvrdnja"));
    await page.reload();
    await page.locator("nav [data-page=more]").click();
    await page.locator("main#app [data-opg-tab=rules]").click();
    assert.equal(await page.locator("#rulesCard .rules-item .rules-new").count(),0);
    assert.equal(await page.evaluate(() => rules.feed.version),2);
    payload=JSON.stringify(old);
    await page.locator("#rulesCheck").click();
    await page.waitForFunction(() => !document.querySelector("#rulesCheck").disabled);
    assert.equal(await page.evaluate(() => rules.feed.version),2);
    payload='{"format":"jato-propisi-1","version":3,"updated":"2026-10-20","items":[{}]}';
    await page.locator("#rulesCheck").click();
    await page.waitForFunction(() => !document.querySelector("#rulesCheck").disabled);
    assert.equal(await page.evaluate(() => rules.feed.version),2);
    assert.match(await page.locator("#rulesCard").textContent(),/zadržane su dosadašnje novosti/);

    // Native bridge simulation: cached background data + notification navigation.
    const android = await context.newPage();
    android.on("pageerror",e=>errors.push(e.message));
    await android.addInitScript(([s,f])=>{
      localStorage.setItem("puran.v1",s);
      localStorage.setItem("puran.rules",JSON.stringify({seen:1,auto:true}));
      window.PURAN_ANDROID=true;window.calls=[];
      window.prompt=(k,raw)=>{
        if(k!=="puran:native")return "";
        const r=JSON.parse(raw);window.calls.push(r);
        if(r.action==="rulesCached")return f;
        if(r.action==="launchPage")return window.calls.filter(c=>c.action==="launchPage").length===1?"rules":"";
        if(r.action==="rulesFetch")return "started";
        if(r.action==="status")return "ready";
        return "ok";
      };
    },[seed,JSON.stringify(feed)]);
    await android.goto("file://"+web);
    assert.equal(await android.evaluate(()=>rules.feed.version),2);
    assert.ok((await android.locator("#rulesCard").textContent()).includes(feed.items[0].summary));
    assert.ok(await android.evaluate(()=>window.calls.some(c=>c.action==="rulesSeen"&&c.version===2)));
    await android.locator("#rulesCheck").click();
    assert.ok(await android.locator("#rulesCheck").isDisabled());
    await android.evaluate(body=>window.puranRulesResult(body,true),JSON.stringify(feed));
    assert.ok(await android.locator("#rulesCheck").isEnabled());
    assert.deepEqual(errors,[]);
    console.log("PASS Jato 1.14.0: real v2 accepted; v1→v2 one new item, all five summaries and disclaimer; read state persists; old/invalid feed retained; simulated Android bridge/cache/notification navigation.");
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

