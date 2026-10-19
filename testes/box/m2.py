import sys,time;sys.path.insert(0,'/tmp');import ck_common as c
from playwright.sync_api import sync_playwright
c.PORT=8099; O='/workspace/games-farol/local_shots/v36_marina_'
with sync_playwright() as p:
    b,pg,logs=c.open_page(p,960,540); c.wait_scene(pg,'menu'); time.sleep(3)
    pg.evaluate("__game.scene.getScene('menu').enterGame(); 0"); c.wait_scene(pg,'vila'); time.sleep(6)
    B="(()=>{const v=__game.scene.getScene('vila'),s=v.player.sprite;return [s.anims.currentAnim&&s.anims.currentAnim.key,s.texture.key,s.frame.name,Math.round(s.displayHeight),Math.round(s.body.width),Math.round(s.body.height),Math.round(s.body.bottom),+s.scaleX.toFixed(3)]})()"
    print('idle',pg.evaluate(B),flush=True)
    pg.keyboard.down("ArrowRight"); time.sleep(2); pg.evaluate("window.__f=[];__game.scene.getScene('vila').events.on('postupdate',()=>{const s=__game.scene.getScene('vila').player.sprite;__f.push(s.frame.name+':'+Math.round(s.body.velocity.x))}); 0"); time.sleep(1); print('walk',pg.evaluate(B)); pg.screenshot(path=O+'walk.png')
    pg.keyboard.down("Shift"); time.sleep(3); print('run',pg.evaluate(B)); pg.screenshot(path=O+'run.png')
    pg.keyboard.up("Shift"); pg.keyboard.up("ArrowRight"); time.sleep(2); print('idle2',pg.evaluate(B)); print(pg.evaluate('__f.slice(0,60)'),logs[:3]); b.close()
