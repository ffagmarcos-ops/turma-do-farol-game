import time
from playwright.sync_api import sync_playwright
S="/workspace/games-farol/local_shots/"
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader"]); pg=b.new_page(viewport={"width":960,"height":540})
    pg.goto("http://127.0.0.1:8099/?play"); pg.evaluate("localStorage.clear()"); pg.reload(); time.sleep(5)
    pg.evaluate("window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyH'}))")
    for x in [2450,5240,7000,7460,9680]:
        pg.evaluate(f"(()=>{{const s=window.__game.scene.getScene('vila');s.player.sprite.setPosition({x},960);s.player.sprite.setVelocity(0,0);s.cameras.main.scrollX={x}-700;}})()"); time.sleep(2.2)
        pg.screenshot(path=f"{S}m7_depois_{x}.png")
    # walk whole map checking y never below ground
    r=pg.evaluate("""(()=>{const s=window.__game.scene.getScene('vila');const T=window.__controlsTest;const P=s.player.sprite;P.setPosition(100,960);let maxY=0;
      for(let i=0;i<2000&&P.x<14200;i++){T.setKeys(['ArrowRight','ShiftLeft', ...(P.x>8700&&P.x<9050?['ArrowDown']:[])]);T.step(33); if(P.x>200)maxY=Math.max(maxY,P.y);} T.setKeys([]);return [Math.round(P.x),Math.round(maxY)]})()""")
    print("walk", r)
    b.close()
