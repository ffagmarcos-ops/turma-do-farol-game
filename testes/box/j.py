import sys,time;sys.path.insert(0,'/tmp');import ck_common as c
from playwright.sync_api import sync_playwright
c.PORT=8099
with sync_playwright() as p:
    b,pg,logs=c.open_page(p,960,540); c.wait_scene(pg,'menu'); time.sleep(3)
    pg.evaluate("__game.scene.getScene('menu').enterGame(); 0"); c.wait_scene(pg,'vila'); time.sleep(6)
    pg.evaluate("window.__f=[];__game.scene.getScene('vila').events.on('postupdate',()=>{const v=__game.scene.getScene('vila'),s=v.player.sprite;__f.push([v.player.state,s.anims.currentAnim.key.slice(7),s.frame.name,Math.round(s.body.bottom),Math.round(s.body.height)])}); 0")
    pg.keyboard.down("ArrowRight"); time.sleep(1); pg.keyboard.down("Space"); time.sleep(0.4); pg.keyboard.up("Space"); time.sleep(0.5)
    pg.screenshot(path='/workspace/games-farol/local_shots/v35_marina_jump.png'); time.sleep(2.5); pg.keyboard.up("ArrowRight")
    print(pg.evaluate("__f.filter((x,i,a)=>i==0||x[1]!=a[i-1][1]||x[2]!=a[i-1][2])"), logs[:3]); b.close()
