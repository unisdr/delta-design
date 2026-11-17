const { chromium } = require('playwright'); const fs=require('fs');
const T=['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200));});
const axe=fs.readFileSync('node_modules/axe-core/axe.min.js','utf8');
const ax=async(n)=>{await p.evaluate(axe);const r=await p.evaluate((T)=>axe.run(document,{runOnly:T}),T);console.log(' axe',n,r.violations.map(v=>v.id+' x'+v.nodes.length+' '+v.nodes[0].html.slice(0,140)));};
await p.goto('file://'+process.cwd()+'/dist/index.html');await p.waitForTimeout(400);
for (const [v,f] of [['System settings','sys'],['Geographic levels','geo'],['Sectors','sec'],['API keys','api'],['Assets','ast']]) {
 await p.getByRole('radio',{name:v,exact:true}).click();await p.waitForTimeout(350);
 console.log(v);await p.screenshot({path:'set-'+f+'.png'});await ax('page');
}
console.log(errs);await b.close();})();
