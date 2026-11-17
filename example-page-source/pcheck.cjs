const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 const axe=fs.readFileSync('node_modules/axe-core/axe.min.js','utf8');
 const ax=async(n)=>{await p.evaluate(axe);const r=await p.evaluate(()=>axe.run(document,{runOnly:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}));console.log(n,'axe',r.violations.map(v=>v.id+' '+v.nodes[0].html.slice(0,90)));};
 await p.goto('file://'+process.cwd()+'/dist/index.html'); await p.waitForTimeout(400);
 await p.getByRole('radio',{name:'Profile'}).click(); await p.waitForTimeout(300);
 await p.screenshot({path:'p1.png'}); await ax('page');
 await p.getByRole('button',{name:'Edit name'}).click(); await p.getByLabel('First name').fill(''); await p.getByRole('button',{name:'Save'}).click(); await p.waitForTimeout(200); await p.screenshot({path:'p2.png'});
 await p.getByLabel('First name').fill('Marie-Claire'); await p.getByRole('button',{name:'Save'}).click(); await p.waitForTimeout(300);
 console.log(await p.getByText('Marie-Claire Joseph').count());
 await p.getByRole('button',{name:'Change password'}).click(); await p.getByRole('dialog').getByRole('button',{name:'Change password'}).click(); await p.waitForTimeout(200); await p.screenshot({path:'p3.png'}); await ax('pw dialog');
 await p.keyboard.press('Escape'); await p.waitForTimeout(300);
 await p.getByRole('button',{name:'Turn on'}).click(); await p.waitForTimeout(300); await p.screenshot({path:'p4.png'}); await ax('totp dialog');
 await p.getByLabel('6-digit code').fill('123456'); await p.getByRole('dialog').getByRole('button',{name:'Turn on'}).click(); await p.waitForTimeout(300);
 await p.screenshot({path:'p5.png'}); console.log(await p.getByRole('button',{name:'Turn off'}).count());
 console.log(errs); await b.close();
})();
