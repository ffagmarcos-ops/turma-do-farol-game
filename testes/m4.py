import time
from playwright.sync_api import sync_playwright
INIT="""(()=>{const a=window.addEventListener.bind(window), r=window.removeEventListener.bind(window); window.__L=new Map();
window.addEventListener=(t,f,o)=>{const k=t+':'+(o===true||o?.capture?'c':''); if(!o?.once){const s=window.__L.get(k)||new Set(); s.add(f); window.__L.set(k,s);} return a(t,f,o)};
window.removeEventListener=(t,f,o)=>{const k=t+':'+(o===true||o?.capture?'c':''); window.__L.get(k)?.delete(f); return r(t,f,o)};
window.__count=()=>{const o={};for(const [k,s] of window.__L) o[k]=s.size; return o};
const AC=window.AudioContext; let n=0; AC.prototype._cbs=AC.prototype.createBufferSource; AC.prototype.createBufferSource=function(){n++;return this._cbs()}; window.__bufs=()=>n;})()"""
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader","--autoplay-policy=no-user-gesture-required"])
    c=b.new_context(viewport={"width":844,"height":390},has_touch=True,is_mobile=True,device_scale_factor=2)
    pg=c.new_page(); pg.add_init_script(INIT); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://127.0.0.1:8099/"); time.sleep(5); pg.touchscreen.tap(422,200); time.sleep(4)
    info=lambda: pg.evaluate("(()=>{const s=window.__game.scene.getScene('vila');const a=s.registry.get('audio');return {L:window.__count(),objs:s.children?.length,tex:window.__game.textures.getTextureKeys().length,music:a.musicNode?1:(a.musicStarted?1:0),ctrl:getComputedStyle(document.querySelector('.touch-controls')).display,save:localStorage.length, scenes:window.__game.scene.getScenes(true).map(x=>x.scene.key)}})()")
    for k in range(3):
        pg.evaluate("(()=>{const s=window.__game.scene.getScene('vila');s.story.toninho=true;s.shellCount=7;s.finishLevel();})()"); time.sleep(4)
        if k==0: pg.screenshot(path="/workspace/games-farol/local_shots/m4_fim.png")
        print("fim",k,info())
        pg.touchscreen.tap(844*620/1920, 390*780/1080 ); time.sleep(4)
        print("restart",k,info())
    # keyboard Esc -> menu
    pg.evaluate("window.__game.scene.getScene('vila').finishLevel()"); time.sleep(4); pg.evaluate("window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape'}))"); time.sleep(3)
    print("esc", pg.evaluate("window.__game.scene.getScenes(true).map(x=>x.scene.key)"), pg.evaluate("getComputedStyle(document.querySelector('.touch-controls')).display"))
    pg.touchscreen.tap(422,200); time.sleep(4); pg.evaluate("window.__game.scene.getScene('vila').finishLevel()"); time.sleep(4)
    pg.touchscreen.tap(844*1300/1920, 390*780/1080); time.sleep(3)
    print("menu btn", pg.evaluate("window.__game.scene.getScenes(true).map(x=>x.scene.key)"))
    print(errs); b.close()
