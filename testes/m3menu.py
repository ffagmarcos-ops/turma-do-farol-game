import time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader"])
    c=b.new_context(viewport={"width":844,"height":390},has_touch=True,is_mobile=True,device_scale_factor=2)
    pg=c.new_page(); pg.goto("http://127.0.0.1:8099/"); time.sleep(5)
    print("menu ctrl", pg.evaluate("getComputedStyle(document.querySelector('.touch-controls')).display"), pg.evaluate("window.__game.scene.getScenes(true).map(s=>s.scene.key)"))
    pg.screenshot(path="/workspace/games-farol/local_shots/m3_menu.png")
    pg.touchscreen.tap(150,120); time.sleep(3)
    print("after tap", pg.evaluate("window.__game.scene.getScenes(true).map(s=>s.scene.key)"), pg.evaluate("getComputedStyle(document.querySelector('.touch-controls')).display"))
    b.close()
