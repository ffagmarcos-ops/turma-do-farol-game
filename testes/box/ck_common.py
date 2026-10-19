import time,json,sys
from playwright.sync_api import sync_playwright
PORT=8111; OUT="/workspace/games-farol/local_shots/v31/"
SAVE="""localStorage.clear(); localStorage.setItem('farol-conchas-v2', JSON.stringify({carteira:120,ganhoTotal:200,run:{id:1,ids:[],bonusF2:true},portas:['vila','mar','marina'],vistos:['intro','menu-portais']})); localStorage.setItem('farol-fase2-done','1')"""
KEYS="__game.scene.getScenes(true).map(s=>s.scene.key).join()"
def open_page(p,w=1280,h=720,save=SAVE):
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader","--autoplay-policy=no-user-gesture-required"]);pg=b.new_page(viewport={"width":w,"height":h});logs=[]
    pg.on("pageerror", lambda e: logs.append("PE "+str(e)[:300]))
    pg.goto(f"http://127.0.0.1:{PORT}/"); pg.evaluate(save); pg.reload()
    return b,pg,logs
def shot(pg,n): pg.screenshot(path=OUT+n,timeout=180000)
def wait_scene(pg,k,t=40):
    for _ in range(t):
        try:
            if k in pg.evaluate(KEYS): return True
        except Exception: pass
        time.sleep(1)
    return False
