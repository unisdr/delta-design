const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+'/tmp/claude-0/-home-claude/f28161ad-747e-517e-b4a6-0eaa66c9a383/scratchpad/emails/delta-emails-preview.html');await p.waitForTimeout(300);
await p.screenshot({path:'../emails/e1.png'});
await p.getByRole('button',{name:'Reset password'}).click();await p.getByRole('button',{name:'Phone'}).click();await p.waitForTimeout(300);await p.screenshot({path:'../emails/e2.png'});
console.log(errs);await b.close();})();
