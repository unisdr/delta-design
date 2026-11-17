const { chromium } = require('playwright'); const fs=require('fs');
const D='/tmp/claude-0/-home-claude/f28161ad-747e-517e-b4a6-0eaa66c9a383/scratchpad/logos/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1000,height:520},deviceScaleFactor:2});
const s6=fs.readFileSync(D+'logo-06.svg','utf8'),s5=fs.readFileSync(D+'logo-05.svg','utf8');
const card=(svg,bg)=>`<div style="background:${bg};padding:24px;border:1px solid #DDE1EC;border-radius:8px;margin-bottom:12px"><div style="height:44px;display:flex;align-items:center"><img style="height:44px" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"></div></div>`;
await p.setContent(`<body style="margin:0;padding:24px;font:13px Inter,sans-serif;background:#F7F8FA"><div style="display:grid;grid-template-columns:1fr 1fr;gap:24px"><div><b>06 (stacked wordmark)</b>${card(s6,'#fff')}${card(s6,'#EEF0F5')}</div><div><b>05 (one line)</b>${card(s5,'#fff')}${card(s5,'#EEF0F5')}</div></div></body>`);
await p.screenshot({path:D+'compare.png'});await b.close();})();
