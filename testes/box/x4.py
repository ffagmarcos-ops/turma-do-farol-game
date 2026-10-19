import sys,time;sys.path.insert(0,'/tmp');import ck_common as c
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader"]);ctx=b.new_context(viewport={"width":960,"height":540},has_touch=True);pg=ctx.new_page()
    pg.goto("http://127.0.0.1:8099/"); pg.evaluate(c.SAVE); pg.reload(); c.wait_scene(pg,'menu'); time.sleep(3)
    for k in range(3):
      pg.evaluate("(()=>{const g=__game.scene;g.getScenes(true).forEach(s=>s.scene.key!=='curiosidade'&&s.scene.stop());g.start('curiosidade',{id:'julia'})})(); 0"); c.wait_scene(pg,'curiosidade'); time.sleep(3)
      if k==1: pg.touchscreen.tap(40,35)
      elif k==2: pg.keyboard.press("Escape")
      else: pg.mouse.click(40,35)
      r=[]
      for t in range(8): time.sleep(1); r.append(pg.evaluate(c.KEYS))
      print(k,pg.evaluate("__game.scene.getScene('curiosidade').leaving"),r,flush=True)
    b.close()
