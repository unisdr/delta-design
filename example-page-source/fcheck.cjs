const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+process.cwd()+'/dist/index.html');
 await p.getByRole('radio',{name:'Access management'}).click();
 await p.getByRole('button',{name:'Edit Marie Joseph'}).click(); await p.waitForTimeout(300);
 const d=p.getByRole('dialog'); console.log('title:', await d.getByRole('heading').textContent(), '| email:', await d.getByLabel('Email address').inputValue());
 await p.screenshot({path:'f-edit.png'});
 const axe=fs.readFileSync('node_modules/axe-core/axe.min.js','utf8'); await p.evaluate(axe);
 const r=await p.evaluate(()=>axe.run(document,{runOnly:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']})); console.log('axe',r.violations.map(v=>v.id));
 await d.getByLabel('Email address').fill('marie.new@dgpc.gouv.ht');
 await d.getByRole('button',{name:'Save changes'}).click(); await p.waitForTimeout(400);
 console.log('row:', await p.getByText('marie.new@dgpc.gouv.ht').count(), '| toast:', await p.locator('.toast').first().textContent());
 console.log(errs); await b.close();
})();
