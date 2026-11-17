const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
const axe=fs.readFileSync('node_modules/axe-core/axe.min.js','utf8');
await p.goto('file://'+process.cwd()+'/dist/index.html');await p.waitForTimeout(400);
for (const v of ['Forms']) {
 await p.getByRole('radio',{name:v,exact:true}).click();await p.waitForTimeout(300);await p.evaluate(axe);
 const r=await p.evaluate(()=>axe.run(document,{runOnly:['wcag21a','wcag21aa','wcag22aa']}));
 r.violations.forEach(x=>x.nodes.forEach(n=>console.log(v,x.id,n.html.slice(0,400), '|', n.failureSummary.slice(0,200))));
}
await b.close();})();
