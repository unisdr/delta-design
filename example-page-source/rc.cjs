const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('file://'+process.cwd()+'/dist/index.html');await p.waitForTimeout(400);
for (const v of ['Organisations','Access management','Events']){
 await p.getByRole('radio',{name:v,exact:true}).click();await p.waitForTimeout(300);
 const r=p.locator('.dtable tbody tr').nth(1); await r.hover({position:{x:200,y:10}}); await p.waitForTimeout(250);
 console.log(v, await r.evaluate(e=>getComputedStyle(e).cursor+' | '+getComputedStyle(e).backgroundColor), '| icon btn cursor:', await r.locator('button').first().evaluate(e=>getComputedStyle(e).cursor).catch(()=>'-'));
}
await p.getByRole('radio',{name:'Organisations',exact:true}).click();await p.locator('.dtable tbody tr').nth(1).hover({position:{x:200,y:10}});await p.waitForTimeout(200);await p.screenshot({path:'o7.png'});
await b.close();})();
