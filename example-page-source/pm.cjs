const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
await p.goto('file://'+process.cwd()+'/dist/index.html');await p.waitForTimeout(400);
await p.getByRole('radio',{name:'Profile'}).click();await p.waitForTimeout(300);
console.log('scrollW',await p.evaluate(()=>document.documentElement.scrollWidth));
await p.screenshot({path:'pm1.png'});
await p.getByRole('button',{name:'Turn on'}).click();await p.waitForTimeout(300);await p.screenshot({path:'pm2.png'});
console.log('scrollW dlg',await p.evaluate(()=>document.documentElement.scrollWidth));await b.close();})();
