const { chromium } = require('playwright'); const fs=require('fs');
const D='/tmp/claude-0/-home-claude/f28161ad-747e-517e-b4a6-0eaa66c9a383/scratchpad/logos/';
(async()=>{const b=await chromium.launch();
for (const [n,svg] of [['06',D+'logo-06.svg'],['05',D+'logo-05.svg']]) {
 const p=await b.newPage({viewport:{width:300,height:100},deviceScaleFactor:8});
 await p.setContent(`<body style="margin:0;background:transparent"><img id=i style="height:36px;display:block" src="data:image/svg+xml;base64,${fs.readFileSync(svg).toString('base64')}"></body>`);
 await p.locator('#i').screenshot({path:D+`delta-resilience-logo-${n}.png`,omitBackground:true});
}
await b.close();})();
