const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}});
 await p.goto('file://'+process.cwd()+'/dist/index.html');
 await p.getByRole('radio',{name:'Access management'}).click();
 await p.getByRole('button',{name:'Invite user'}).click();
 const d=p.getByRole('dialog');
 console.log('before submit:', await d.locator('.field-error:visible').allTextContents());
 await d.getByLabel('Email address').fill('asd@d');
 await d.getByRole('button',{name:/Organisation/}).click(); await p.getByRole('option',{name:'UNDRR Bangkok'}).click();
 console.log('typed, no submit:', await d.locator('.field-error:visible').allTextContents());
 await p.getByRole('button',{name:'Send invitation',exact:true}).click();
 console.log('after submit:', JSON.stringify(await d.locator('.field-error:visible').allTextContents()));
 await b.close();
})();
