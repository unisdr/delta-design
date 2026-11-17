const { chromium } = require('playwright'); const fs=require('fs');
const T=['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
const axe=fs.readFileSync('node_modules/axe-core/axe.min.js','utf8');
const ax=async(n)=>{await p.evaluate(axe);const r=await p.evaluate((T)=>axe.run(document,{runOnly:T}),T);console.log(' axe',n,r.violations.map(v=>v.id+' x'+v.nodes.length+' '+v.nodes[0].html.slice(0,160)));};
const go=async(v)=>{await p.getByRole('radio',{name:v,exact:true}).click();await p.waitForTimeout(350);console.log('==',v);};
const dlg=()=>p.locator('.modal-dialog');
await p.goto('file://'+process.cwd()+'/dist/index.html');await p.waitForTimeout(400);

await go('System settings');
await p.getByRole('button',{name:'Edit'}).click();await p.waitForTimeout(250);await ax('edit');await p.screenshot({path:'c-sys.png'});
await p.getByRole('textbox',{name:'Instance name'}).fill('');await p.getByRole('button',{name:'Save changes'}).click();await p.waitForTimeout(150);console.log(' err shown',await p.getByText('Enter an instance name.').count());
await p.getByRole('textbox',{name:'Instance name'}).fill('DGPC Haiti (national)');await p.getByRole('button',{name:/Language/}).click();await p.getByRole('option',{name:'English'}).click();
await p.getByRole('button',{name:'Save changes'}).click();await p.waitForTimeout(300);console.log(' saved',await p.getByText('DGPC Haiti (national)').count(),await p.locator('dd',{hasText:'English'}).count());

await go('API keys');
await p.getByRole('button',{name:'Add API key'}).click();await p.waitForTimeout(200);
await p.getByRole('button',{name:'Create key'}).click();await p.waitForTimeout(150);console.log(' err',await p.getByText('Enter a name.').count());
await p.getByRole('textbox',{name:'Name',exact:true}).fill('Weather service feed');await p.getByRole('button',{name:'Create key'}).click();await p.waitForTimeout(300);
await ax('created');await p.screenshot({path:'c-api.png'});
await p.getByRole('button',{name:'Copy key',exact:true}).click();await p.waitForTimeout(150);
await p.getByRole('button',{name:'Done'}).click();await p.waitForTimeout(300);console.log(' rows',await p.locator('.dtable tbody tr').count());
await p.getByRole('button',{name:'Delete Weather service feed'}).click();await p.waitForTimeout(250);await ax('delete');
await p.getByRole('button',{name:'Delete key',exact:true}).click();await p.waitForTimeout(300);console.log(' rows after delete',await p.locator('.dtable tbody tr').count());

await go('Assets');
await p.getByRole('button',{name:'Add asset'}).click();await p.waitForTimeout(250);
await p.getByRole('dialog').getByRole('button',{name:'Add asset'}).click();await p.waitForTimeout(150);console.log(' err',await p.getByText('Enter a name.').count());
await p.getByRole('textbox',{name:'Name',exact:true}).fill('Rural radio station');await p.getByRole('textbox',{name:/Category/}).fill('Networks');
await p.getByRole('button',{name:/Sectors/}).click();await p.waitForTimeout(200);await p.getByRole('option',{name:'Telecommunications'}).click();await p.getByRole('option',{name:'Education'}).click();await p.keyboard.press('Escape');await p.waitForTimeout(200);
await ax('add');await p.screenshot({path:'c-ast.png'});
await p.getByRole('dialog').getByRole('button',{name:'Add asset'}).click();await p.waitForTimeout(300);
await p.getByRole('searchbox').fill('radio');await p.waitForTimeout(250);console.log(' search rows',await p.locator('.dtable tbody tr').count(), await p.locator('.dtable tbody tr').first().textContent());
await p.getByRole('searchbox').fill('');await p.getByRole('button',{name:'View Hospital'}).click();await p.waitForTimeout(250);await ax('view');await p.screenshot({path:'c-ast2.png'});await p.keyboard.press('Escape');await p.waitForTimeout(250);
await p.getByRole('button',{name:'Import CSV'}).click();await p.waitForTimeout(250);await p.getByRole('button',{name:'Import',exact:true}).click();await p.waitForTimeout(150);console.log(' import err',await p.getByText('Choose a CSV file to import.').count());await ax('import');await p.screenshot({path:'c-ast3.png'});await p.keyboard.press('Escape');await p.waitForTimeout(250);
await p.getByRole('button',{name:/Type|All types/}).first().click();await p.getByRole('option',{name:'Custom'}).click();await p.waitForTimeout(250);console.log(' custom rows',await p.locator('.dtable tbody tr').count());

await go('Sectors');
console.log(' rows',await p.getByRole('row').count());
await p.getByRole('row',{name:/Housing/}).first().click();await p.waitForTimeout(250);console.log(' after open Housing',await p.getByRole('row').count());
await p.getByRole('button',{name:'Collapse all'}).click();await p.waitForTimeout(200);console.log(' collapsed',await p.getByRole('row').count());
await p.getByRole('searchbox').fill('cereal');await p.waitForTimeout(250);console.log(' search',await p.getByRole('row').count());await p.screenshot({path:'c-sec.png'});await ax('search');
await p.getByRole('searchbox').fill('zzzz');await p.waitForTimeout(200);console.log(' empty',await p.getByText('No sectors match').count());

await go('Geographic levels');
await p.getByRole('row',{name:/Port-au-Prince/}).first().click();await p.waitForTimeout(250);console.log(' rows',await p.getByRole('row').count());
await p.getByRole('button',{name:'Add a division inside Ouest'}).click();await p.waitForTimeout(300);await ax('add');await p.screenshot({path:'c-geo.png'});
await p.getByRole('button',{name:'Add division'}).last().click();await p.waitForTimeout(150);console.log(' err',await p.getByText('Enter the name in English.').count());
await p.getByRole('textbox',{name:'Name (English)'}).fill('Arcahaie');await p.getByRole('button',{name:'Add division'}).last().click();await p.waitForTimeout(150);console.log(' id required',await p.getByText('Enter the national ID.').count());await p.getByRole('textbox',{name:/National ID/}).fill('HT0112');await p.getByRole('button',{name:'Add division'}).last().click();await p.waitForTimeout(150);console.log(' dup id',await p.getByText('Another division already uses this ID.').count());
await p.getByRole('textbox',{name:/National ID/}).fill('HT014');await p.getByRole('button',{name:'Add division'}).last().click();await p.waitForTimeout(300);console.log(' added',await p.getByRole('row',{name:/Arcahaie/}).count());
await p.getByRole('button',{name:'Delete Ouest'}).click();await p.waitForTimeout(250);console.log(' blocked children:',(await dlg().textContent()).slice(0,120));await ax('blocked');await p.keyboard.press('Escape');await p.waitForTimeout(250);
await p.getByRole('button',{name:'Delete Delmas'}).click();await p.waitForTimeout(250);console.log(' blocked linked:',(await dlg().textContent()).slice(0,90));await p.keyboard.press('Escape');await p.waitForTimeout(250);
await p.getByRole('button',{name:'Delete Arcahaie'}).click();await p.waitForTimeout(250);await p.getByRole('button',{name:'Delete division'}).click();await p.waitForTimeout(300);console.log(' deleted',await p.getByRole('row',{name:/Arcahaie/}).count());
await p.getByRole('button',{name:'Edit Kenscoff'}).click();await p.waitForTimeout(250);await p.getByRole('button',{name:/Belongs to/}).click();await p.waitForTimeout(200);await p.screenshot({path:'c-geo2.png'});await p.getByRole('option',{name:'Léogâne'}).first().click();await p.getByRole('button',{name:'Save changes'}).click();await p.waitForTimeout(300);
console.log(' moved: PaP children now', await p.getByRole('row',{name:/Kenscoff/}).count());
await p.getByRole('button',{name:'Upload ZIP'}).click();await p.waitForTimeout(250);await ax('upload');await p.screenshot({path:'c-geo3.png'});
await p.getByRole('button',{name:'Upload and import'}).click();await p.waitForTimeout(150);console.log(' upload err',await p.getByText('Choose a ZIP file to upload.').count());await p.keyboard.press('Escape');await p.waitForTimeout(250);
// keyboard in the tree
await p.getByRole('row',{name:/^Haiti/}).first().focus();await p.keyboard.press('ArrowDown');await p.keyboard.press('ArrowDown');
const f1=await p.evaluate(()=>document.activeElement.textContent.slice(0,30));
await p.keyboard.press('Tab');const f2=await p.evaluate(()=>document.activeElement.getAttribute('aria-label')||document.activeElement.tagName);
await p.keyboard.press('Tab');const f3=await p.evaluate(()=>document.activeElement.getAttribute('aria-label')||document.activeElement.tagName);
console.log(' keyboard: row',f1,'| tab ->',f2,'| tab ->',f3);
// nav menu opens screens
await p.getByRole('button',{name:'Settings'}).click();await p.waitForTimeout(200);await p.getByRole('menuitem',{name:/API keys/}).click();await p.waitForTimeout(300);console.log(' nav ->',await p.locator('h1').first().textContent());
// phone width
const m=await b.newPage({viewport:{width:390,height:800}});await m.goto('file://'+process.cwd()+'/dist/index.html');
for (const v of ['System settings','Geographic levels','Sectors','API keys','Assets']){await m.getByRole('radio',{name:v,exact:true}).click();await m.waitForTimeout(300);console.log(' phone',v,await m.evaluate(()=>document.documentElement.scrollWidth));await m.screenshot({path:'m-'+v.split(' ')[0]+'.png'});}
console.log(errs);await b.close();})();
