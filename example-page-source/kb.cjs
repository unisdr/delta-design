const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('file://'+process.cwd()+'/dist/index.html');await p.waitForTimeout(400);
await p.getByRole('radio',{name:'Geographic levels',exact:true}).click();await p.waitForTimeout(350);
const who=()=>p.evaluate(()=>{const e=document.activeElement;return (e.getAttribute('role')||e.tagName)+' | '+(e.getAttribute('aria-label')||e.getAttribute('slot')||e.className.slice(0,20))+' | '+e.textContent.slice(0,18);});
await p.getByRole('searchbox').focus();
for (const k of ['Tab','Tab','Tab','ArrowDown','ArrowDown','ArrowDown','ArrowDown','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowLeft','ArrowDown','ArrowRight','ArrowRight','Enter']) { await p.keyboard.press(k); console.log(k.padEnd(10), await who()); }
await b.close();})();
