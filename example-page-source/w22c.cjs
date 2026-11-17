const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
const axe=fs.readFileSync('node_modules/axe-core/axe.min.js','utf8');
await p.goto('file://'+process.cwd()+'/dist/index.html');await p.waitForTimeout(400);
await p.getByRole('radio',{name:'States',exact:true}).click();await p.waitForTimeout(300);await p.evaluate(axe);
const r=await p.evaluate(()=>axe.run(document,{runOnly:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}));
r.violations.forEach(x=>x.nodes.forEach(n=>console.log(x.id,'|',n.html.slice(0,300),'|',n.failureSummary.slice(0,300))));
await b.close();})();
