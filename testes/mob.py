import time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader"])
    c=b.new_context(viewport={"width":844,"height":390},has_touch=True,is_mobile=True,device_scale_factor=2)
    pg=c.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://127.0.0.1:8099/"); time.sleep(5)
    pg.screenshot(path="/workspace/games-farol/local_shots/m_menu.png")
    pg.mouse.click(422,330); time.sleep(4)  # Entrar na vila
    print("scene", pg.evaluate("window.__game.scene.getScenes(true).map(s=>s.scene.key)"))
    pg.screenshot(path="/workspace/games-farol/local_shots/m_jogo.png")
    vis=pg.evaluate("getComputedStyle(document.querySelector('.touch-controls')).display"); print("controls",vis)
    # tap right via pointer on DOM button
    box=pg.locator("[data-k=right]").bounding_box(); pg.mouse.move(box["x"]+20,box["y"]+20); pg.mouse.down(); time.sleep(2); pg.mouse.up()
    print("x after right", pg.evaluate("window.__controlsTest.getX()"))
    # beam test: teleport before net, crouch+right then release crouch under net
    pg.evaluate("(()=>{const s=window.__game.scene.getScene('vila');s.player.sprite.setPosition(8600,960);})()")
    r=pg.evaluate("""(()=>{const s=window.__game.scene.getScene('vila');const T=window.__controlsTest;
      for(let i=0;i<40;i++){T.setKeys(['ArrowDown']);T.step(33);}
      let i=0; while(s.player.x<8860 && i<400){T.setKeys(['ArrowDown','ArrowRight']);T.step(33);i++;}
      const a=[Math.round(s.player.x), s.player.state];
      for(let j=0;j<300 && s.player.x<9100;j++){T.setKeys(['ArrowRight']);T.step(33);}
      return {a, x:Math.round(s.player.x), st:s.player.state};})()""")
    print("beam", r, errs); b.close()
