const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
const axe=fs.readFileSync('node_modules/axe-core/axe.min.js','utf8');
await p.goto('file://'+process.cwd()+'/dist/index.html');await p.waitForTimeout(400);
for (const v of ['Events','Forms','States','Charts','Event detail','Log in','Reset password','Access management','Profile','Organizations','System settings','Geographic levels','Sectors','API keys','Assets']) {
 await p.getByRole('radio',{name:v,exact:true}).click();await p.waitForTimeout(300);
 await p.evaluate(axe);
 const r=await p.evaluate(()=>axe.run(document,{runOnly:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}));
 console.log(v,r.violations.map(x=>x.id+' x'+x.nodes.length).join(', ')||'none');
}
await b.close();})();
