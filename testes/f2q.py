import time,sys
from playwright.sync_api import sync_playwright
out="/workspace/games-farol/local_shots/"
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader"])
    pg=b.new_page(viewport={"width":1280,"height":720}); logs=[]
    pg.on("console", lambda m: logs.append(m.text) if m.type=="error" else None)
    pg.on("pageerror", lambda e: logs.append("PAGEERROR "+str(e)))
    pg.on("response", lambda r: logs.append("404 "+r.url) if r.status==404 else None)
    pg.goto("http://127.0.0.1:8099/?boss=1"); time.sleep(8)
    pg.evaluate("for(let i=0;i<70;i++){__boss.confirmPressed=true;__boss.step(0.033)}")
    pg.evaluate("(()=>{const B=__boss;for(let i=0;i<300;i++){B.step(0.033); if(B.tentacles.some(t=>t.state==='raised')) break;}})()")
    pg.screenshot(path=out+"_q_raised.png")
    pg.evaluate("(()=>{const B=__boss;for(let i=0;i<60;i++){B.step(0.033); if(B.tentacles.some(t=>t.state==='vulnerable'&&t.t>0.2)) break;}})()")
    pg.screenshot(path=out+"_q_vuln.png")
    print(pg.evaluate("[__boss.octo.body.texture.key, __boss.crew.boat.texture.key, __boss.lucasP.sp.texture.key, !!__boss.cc0.on, __boss.baud.buf.size]"))
    print(logs[:12]); b.close()
