const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});
 await p.goto('file://'+process.cwd()+'/dist/index.html');
 await p.getByRole('radio',{name:'Log in'}).click(); await p.waitForTimeout(400);
 await p.addStyleTag({content:'.proto{display:none!important}'});
 const out='../login-screens/';
 await p.screenshot({path:out+'1-sign-in.png'});
 await p.getByRole('button',{name:'Sign in',exact:true}).click(); await p.waitForTimeout(200);
 await p.screenshot({path:out+'2-sign-in-errors.png'});
 await p.getByRole('link',{name:'Forgot your password?'}).click(); await p.waitForTimeout(200);
 await p.screenshot({path:out+'3-forgot-password.png'});
 await p.getByLabel('Email').fill('marie.joseph@dgpc.gouv.ht'); await p.getByRole('button',{name:'Send reset link'}).click(); await p.waitForTimeout(200);
 await p.screenshot({path:out+'4-check-your-email.png'});
 await b.close();
})();
