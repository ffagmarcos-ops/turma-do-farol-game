import time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader"]); pg=b.new_page(viewport={"width":960,"height":540})
    pg.goto("http://127.0.0.1:8099/?play"); time.sleep(5)
    pg.evaluate("window.__game.scene.getScene('vila').finishLevel()"); time.sleep(4)
    print(pg.evaluate("(()=>{const s=window.__game.scene.getScene('vila');return [!!s.onEndKey, !!s.endButtons, s.finished]})()"))
    pg.keyboard.press("Escape"); time.sleep(2); print(pg.evaluate("window.__game.scene.getScenes(true).map(x=>x.scene.key)"))
    b.close()
