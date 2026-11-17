const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}});
 await p.goto('file://'+process.cwd()+'/dist/index.html');
 await p.getByRole('radio',{name:'Access management'}).click();
 await p.getByRole('button',{name:'Invite user'}).click();
 await p.getByRole('button',{name:'Send invitation',exact:true}).click();
 const d=p.getByRole('dialog'); console.log('errors shown:', await d.locator('.field-error:visible').count());
 await d.getByLabel('Email address').fill('hello@hello.org'); console.log('after email:', await d.locator('.field-error:visible').allTextContents());
 await d.getByRole('button',{name:/Organisation/}).click(); await p.getByRole('option',{name:'UNDRR Bangkok'}).click();
 console.log('after org:', await d.locator('.field-error:visible').allTextContents());
 await d.getByRole('button',{name:/Role/}).click(); await p.getByRole('option',{name:'Data viewer'}).click();
 console.log('after role:', await d.locator('.field-error:visible').allTextContents());
 await b.close();
})();
