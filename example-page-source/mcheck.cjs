const { chromium } = require('playwright');
const fs=require('fs');
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('file://'+process.cwd()+'/dist/index.html'); await p.waitForTimeout(500);
 await p.screenshot({path:'m-events.png'});
 for (const v of ['Forms','States','Charts','Event detail']) {
   await p.getByRole('radio',{name:v}).click().catch(async()=>{await p.getByText(v,{exact:true}).last().click()});
   await p.waitForTimeout(500); await p.screenshot({path:`m-${v}.png`,fullPage:true});
 }
 await p.evaluate(()=>window.scrollTo(0,0));
 const axe=fs.readFileSync('node_modules/axe-core/axe.min.js','utf8'); await p.evaluate(axe);
 const r=await p.evaluate(()=>axe.run(document,{runOnly:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}));
 console.log('axe violations',r.violations.map(v=>v.id+':'+v.nodes.length+' '+v.nodes[0].html.slice(0,100)));
 console.log('errors',errs);
 await b.close();
})();
