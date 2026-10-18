import time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader"])
    pg=b.new_page(viewport={"width":960,"height":540})
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://127.0.0.1:8099/?play"); pg.evaluate("localStorage.clear()"); pg.reload(); time.sleep(5)
    r=pg.evaluate("""(()=>{const s=window.__game.scene.getScene('vila');const T=window.__controlsTest;const L=[];
      for(const sh of s.shells.getChildren().slice()){ s.player.sprite.setPosition(sh.x, sh.y+100); s.player.sprite.setVelocity(0,0); for(let i=0;i<4;i++)T.step(16); L.push(s.shellCount);}
      const cps=[]; for(const x of [4300,8800,12400]){ s.player.sprite.setPosition(x,900); for(let i=0;i<10;i++)T.step(16); cps.push(JSON.stringify(localStorage).slice(0,0)+ (s.checkpoints.activeX||s.checkpoints.current||JSON.stringify(Object.keys(s.checkpoints)))); }
      return {L, cps, prog: localStorage.getItem(Object.keys(localStorage)[0])};})()""")
    print(r, errs); b.close()
