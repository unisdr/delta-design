const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}});
 await p.goto('file://'+process.cwd()+'/dist/index.html');
 await p.getByRole('radio',{name:'Access management'}).click();
 await p.getByRole('button',{name:'Invite user'}).click();
 const d=p.getByRole('dialog');
 await d.getByLabel('Email address').fill('maria-fernanda.gonzalez-hernandez-de-la-cruz@ministerio-de-gestion-de-riesgos-de-desastres.gob.example');
 await d.getByRole('button',{name:/Organisation/}).click(); await p.getByRole('option',{name:'Ministry of Interior'}).click();
 await d.getByRole('button',{name:/Role/}).click(); await p.getByRole('option',{name:'Data viewer'}).click();
 await p.getByRole('button',{name:'Send invitation',exact:true}).click(); await p.waitForTimeout(400);
 await p.screenshot({path:'e-table-long.png'});
 const sw=await p.evaluate(()=>[document.documentElement.scrollWidth, document.querySelector('.overflow-x-auto').scrollWidth, document.querySelector('.overflow-x-auto').clientWidth]);
 console.log('page/scroll/client widths', sw);
 const m=await b.newPage({viewport:{width:390,height:800}}); await m.goto('file://'+process.cwd()+'/dist/index.html');
 await m.getByRole('radio',{name:'Access management'}).click(); await m.waitForTimeout(300);
 console.log('mobile page scrollWidth', await m.evaluate(()=>document.documentElement.scrollWidth));
 await b.close();
})();
