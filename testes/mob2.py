import time
from playwright.sync_api import sync_playwright
S="/workspace/games-farol/local_shots/m2_"
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader"])
    c=b.new_context(viewport={"width":844,"height":390},has_touch=True,is_mobile=True,device_scale_factor=2)
    pg=c.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://127.0.0.1:8099/"); pg.evaluate("localStorage.clear()"); pg.reload(); time.sleep(5)
    pg.screenshot(path=S+"menu.png"); pg.touchscreen.tap(422,330); time.sleep(4)
    cdp=c.new_cdp_session(pg)
    def box(sel): bb=pg.locator(sel).bounding_box(); return bb["x"]+bb["width"]/2, bb["y"]+bb["height"]/2
    L=box(".dpad .l"); R=box(".dpad .r"); D=box(".dpad .d"); J=box(".act.jump")
    st=lambda: pg.evaluate("(()=>{const s=window.__game.scene.getScene('vila');return [Math.round(s.player.x),Math.round(s.player.y),s.player.state,Math.round(s.player.sprite.body.velocity.x)]})()")
    def touch(t,pts): cdp.send("Input.dispatchTouchEvent",{"type":t,"touchPoints":[{"x":x,"y":y,"id":i} for i,(x,y) in pts]})
    touch("touchStart",[(0,R)]); time.sleep(1.5); print("right",st()); pg.screenshot(path=S+"andando.png")
    touch("touchMove",[(0,L)]); time.sleep(1.0); print("slide left",st())
    touch("touchMove",[(0,R)]); time.sleep(0.6)
    touch("touchStart",[(0,R),(1,J)]); time.sleep(0.25); print("walk+jump",st()); pg.screenshot(path=S+"pulo_multitoque.png")
    touch("touchEnd",[(0,R)]); time.sleep(0.2); touch("touchEnd",[]); time.sleep(0.5)
    pg.evaluate("(()=>{const s=window.__game.scene.getScene('vila');s.player.sprite.setPosition(8620,960);s.player.sprite.setVelocity(0,0);s.cameras.main.scrollX=8000})()"); time.sleep(1)
    touch("touchStart",[(0,D)]); time.sleep(0.8); DR=((D[0]+R[0])/2+8,(D[1]+R[1])/2+8); touch("touchMove",[(0,DR)]); 
    for i in range(30):
        time.sleep(0.3)
        if st()[0]>8830: break
    print("under net", st()); pg.screenshot(path=S+"rede_agachada.png")
    touch("touchEnd",[]); time.sleep(0.6); print("released",st())
    touch("touchStart",[(0,R)]); time.sleep(4); touch("touchEnd",[]); print("after net",st())
    print(errs); b.close()
