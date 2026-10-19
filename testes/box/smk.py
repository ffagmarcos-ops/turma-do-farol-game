import sys,time,json;sys.path.insert(0,'/tmp');import ck_common as c
from playwright.sync_api import sync_playwright
c.PORT=int(sys.argv[1])
with sync_playwright() as p:
    b,pg,logs=c.open_page(p,640,360); c.wait_scene(pg,'menu'); time.sleep(3)
    pg.evaluate("const m=__game.scene.getScene('menu'); m.openSom(); 0"); time.sleep(2)
    pg.screenshot(path='/workspace/games-farol/local_shots/v33_som.png')
    print("som",pg.evaluate("(()=>{const a=__game.registry.get('audio');a.unlock();a.setPrefs({music:0.4,sfx:0.7});return [!!__game.scene.getScene('menu').__som,localStorage.getItem('farol-som'),a.buses&&+a.buses.music.gain.value.toFixed(2)]})()"),flush=True)
    pg.evaluate("__game.scene.getScene('menu').__som.close(); __game.registry.get('audio').setPrefs({music:1,sfx:1}); __game.scene.getScene('menu').enterGame(); 0"); c.wait_scene(pg,'vila'); time.sleep(6)
    pg.evaluate("window.__s=[]; const v=__game.scene.getScene('vila'); v.events.on('postupdate',()=>{const s=v.player.sprite;__s.push([s.anims.currentAnim&&s.anims.currentAnim.key,s.frame.name,+s.anims.timeScale.toFixed(2),v.player.state])}); 0")
    pg.keyboard.down("ArrowRight"); time.sleep(4); pg.keyboard.down("Shift"); time.sleep(3); pg.keyboard.up("Shift"); pg.keyboard.up("ArrowRight")
    s=pg.evaluate("__s"); print(len(s), [x[1] for x in s], sorted(set((x[0],x[3]) for x in s)), s[-5:])
    print(pg.evaluate("__game.loop.actualFps"), logs[:3]); b.close()
