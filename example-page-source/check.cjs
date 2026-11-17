const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1360, height: 900 }, deviceScaleFactor: 1 });
  const errs = [];
  p.on('console', m => { if (['error','warning'].includes(m.type())) errs.push(m.type()+': '+m.text().slice(0,200)); });
  p.on('pageerror', e => errs.push('pageerror: '+e.message.slice(0,200)));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.goto('file://' + process.cwd() + '/dist-components/components.html'); await p.waitForTimeout(600);
  await p.screenshot({ path: '../cmp-full.png', fullPage: true });
  // axe
  await p.addScriptTag({ content: fs.readFileSync('node_modules/axe-core/axe.min.js','utf8') });
  const ax = await p.evaluate(async () => { const r = await axe.run(document, { runOnly: ['wcag2a','wcag2aa','wcag21aa'] }); return r.violations.map(v => ({ id: v.id, n: v.nodes.length, impact: v.impact, ex: v.nodes[0].html.slice(0,120), sum: v.nodes[0].failureSummary.slice(0,200) })); });
  console.log('AXE', JSON.stringify(ax, null, 1));
  // interactions
  const res = {};
  await p.getByRole('button', { name: 'Show password' }).click(); res.pwShown = await p.getByRole('textbox', { name: 'Password' }).getAttribute('type');
  await p.getByLabel('Event date').fill('20260914'); res.mask = await p.getByLabel('Event date').inputValue();
  await p.getByRole('button', { name: /Remove/ }).first().click(); res.tagsAfterRemove = await p.locator('[aria-label="Hazards"]').first().innerText();
  await p.getByRole('button', { name: /All hazards/ }).click(); await p.waitForTimeout(300);
  const lb=p.getByRole('listbox',{name:'Hazards'}); await lb.getByRole('option', { name: 'Flood' }).click(); await lb.getByRole('option', { name: 'Drought' }).click(); await p.waitForTimeout(250);
  res.multiOpenAfterClicks = await p.getByRole('listbox',{name:'Hazards'}).count(); await p.screenshot({ path: '../cmp-multi.png' }); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  res.multiLabel = await p.locator('button:has-text("hazards selected")').innerText();
  await p.getByRole('button', { name: 'What counts as a disaster event?' }).click(); await p.waitForTimeout(400);
  res.accordionExpanded = await p.getByRole('button', { name: 'What counts as a disaster event?' }).getAttribute('aria-expanded');
  await p.getByRole('radio', { name: 'Chart' }).click().catch(async()=>{ await p.getByText('Chart', {exact:true}).click(); });
  res.segSelected = await p.locator('[data-selected="true"]').allInnerTexts();
  await p.getByRole('button', { name: 'Hazard type' }).click(); await p.waitForTimeout(300);
  await p.screenshot({ path: '../cmp-treeselect-open.png' });
  await p.getByRole('row', { name: 'Earthquake' }).last().click().catch(e=>{res.treeClickErr=String(e).slice(0,120)}); await p.waitForTimeout(300);
  res.treeSelectLabel = await p.getByRole('button', { name: 'Hazard type' }).innerText();
  await p.getByText('Export', { exact: true }).hover(); await p.waitForTimeout(600); res.tooltip = await p.getByRole('tooltip').count();
  console.log('RES', JSON.stringify(res, null, 1));
  console.log('ERRS', JSON.stringify(errs.slice(0,10), null, 1));
  await b.close();
})();
