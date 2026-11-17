const { chromium } = require('playwright'); const fs=require('fs');
const T=['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
const axe=fs.readFileSync('node_modules/axe-core/axe.min.js','utf8');
const ax=async(n)=>{await p.evaluate(axe);const r=await p.evaluate((T)=>axe.run(document,{runOnly:T}),T);console.log(n,'axe',r.violations.map(v=>v.id+' '+v.nodes[0].html.slice(0,120)));};
await p.goto('file://'+process.cwd()+'/dist/index.html');await p.waitForTimeout(400);
for (const v of ['Access management','Organizations']) {
 await p.getByRole('radio',{name:v,exact:true}).click();await p.waitForTimeout(300);
 const info=async()=>[await p.locator('.dtable tbody tr').count(), await p.getByText(/^Showing/).textContent(), await p.getByText(/^Page \d+ of/).textContent()].join(' | ');
 console.log(v, await info());
 await p.getByRole('button',{name:'Next page'}).click();await p.waitForTimeout(200);console.log(' next:', await info());
 await p.getByRole('button',{name:/Rows per page/}).click();await p.waitForTimeout(200);
 if (v==='Access management') await p.screenshot({path:'pg1.png',fullPage:false});
 await ax(v+' open');
 await p.getByRole('option',{name:'50'}).click();await p.waitForTimeout(300);console.log(' 50:', await info());
}
await p.getByRole('radio',{name:'Access management',exact:true}).click();await p.waitForTimeout(300);
await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await p.waitForTimeout(200);await p.screenshot({path:'pg2.png'});
const m=await b.newPage({viewport:{width:390,height:800}});await m.goto('file://'+process.cwd()+'/dist/index.html');await m.getByRole('radio',{name:'Access management'}).click();await m.waitForTimeout(300);
console.log('mobile scrollW',await m.evaluate(()=>document.documentElement.scrollWidth));
await m.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await m.waitForTimeout(200);await m.screenshot({path:'pg3.png'});
console.log(errs);await b.close();})();
