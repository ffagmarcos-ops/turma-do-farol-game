import time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader"])
    pg=b.new_page(viewport={"width":1280,"height":720})
    pg.goto("http://127.0.0.1:8099/?boss=1"); time.sleep(8)
    pg.evaluate("for(let i=0;i<70;i++){__boss.confirmPressed=true;__boss.step(0.033)}")
    print(pg.evaluate("""(()=>{const B=__boss;let r=[];for(let i=0;i<300;i++){B.step(0.033); const t=B.tentacles.find(t=>t.state==='raised'); if(t){const v=t.v; return [t.mode,t.est,!!v, v&&v.visible, v&&v.frame.name, v&&v.x, v&&v.y, v&&v.scaleX, v&&v.scaleY, v&&v.alpha, v&&v.depth, v&&v.texture.key]}} return 'none'})()"""))
    b.close()
