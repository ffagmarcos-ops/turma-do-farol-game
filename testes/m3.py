import time
from playwright.sync_api import sync_playwright
S="/workspace/games-farol/local_shots/m3_"
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader"])
    pg=b.new_page(viewport={"width":960,"height":540}); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://127.0.0.1:8099/?play"); pg.evaluate("localStorage.clear()"); pg.reload(); time.sleep(5)
    T="window.__controlsTest"
    pg.evaluate(f"(()=>{{const s=window.__game.scene.getScene('vila');s.player.sprite.setPosition(4900,960);s.cameras.main.scrollX=4200;}})()"); time.sleep(1.5)
    pg.evaluate(f"{T}.setKeys(['KeyE'])"); time.sleep(0.4); pg.evaluate(f"{T}.setKeys([])"); time.sleep(1.2)
    print("dlg", pg.evaluate("window.__game.scene.getScene('vila').hud.dialogueText.visible"))
    pg.screenshot(path=S+"dialogo.png")
    for i in range(8): pg.evaluate(f"{T}.setKeys(['KeyE'])"); time.sleep(0.3); pg.evaluate(f"{T}.setKeys([])"); time.sleep(0.3)
    pg.evaluate("(()=>{const s=window.__game.scene.getScene('vila');s.player.sprite.setPosition(8650,960);s.cameras.main.scrollX=8150;})()"); time.sleep(1)
    pg.evaluate("window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyH'}))"); time.sleep(0.5); print("debug", pg.evaluate("window.__game.scene.getScene('vila').physics.world.drawDebug"))
    r=pg.evaluate(f"""(()=>{{const s=window.__game.scene.getScene('vila');const T={T};
      const out=[];for(let i=0;i<20;i++){{T.setKeys(['ArrowDown']);T.step(33);}}
      let i=0; while(s.player.x<8880&&i<300){{T.setKeys(['ArrowDown','ArrowRight']);T.step(33);i++;}}
      T.setKeys([]); for(let k=0;k<5;k++)T.step(33);
      const b=s.player.sprite.body; return {{x:Math.round(s.player.x),st:s.player.state,bodyTop:Math.round(b.top),sprTop:Math.round(s.player.sprite.getBounds().top)}};}})()""")
    print(r); time.sleep(1.5); pg.screenshot(path=S+"rede.png")
    # standing blocked?
    r2=pg.evaluate(f"""(()=>{{const s=window.__game.scene.getScene('vila');const T={T};s.player.sprite.setPosition(8600,960);
      for(let i=0;i<120;i++){{T.setKeys(['ArrowRight']);T.step(33);}} return Math.round(s.player.x+s.player.sprite.body.width/2);}})()""")
    print("standing stops at right edge", r2, errs); b.close()
