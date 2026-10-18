import time, json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader"]); pg=b.new_page(viewport={"width":960,"height":540})
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type=="error" and "404" not in m.text else None)
    pg.goto("http://127.0.0.1:8099/?play"); pg.evaluate("localStorage.clear()"); pg.reload(); time.sleep(5)
    r=pg.evaluate("""(()=>{const s=window.__game.scene.getScene('vila');const T=window.__controlsTest;const P=s.player.sprite;const R={};
     const run=(k,n)=>{for(let i=0;i<n;i++){T.setKeys(k);T.step(33);}T.setKeys([]);};
     P.setPosition(200,960);run(['ArrowLeft','ShiftLeft'],60);R.leftEdge=Math.round(P.x);
     P.setPosition(14000,960);run(['ArrowRight','ShiftLeft'],60);R.rightEdge=Math.round(P.x);
     P.setPosition(7460,960);P.setVelocity(0,0);run([],60);R.gapFloorY=Math.round(P.y);
     run(['ArrowRight','Space'],8);run(['ArrowRight'],40);R.outOfGap=[Math.round(P.x),Math.round(P.y)];
     run(['Space'],1);run([],30);R.jumpPeak=(()=>{P.setPosition(3000,968);P.setVelocity(0,0);run([],5);let m=1e9;for(let i=0;i<40;i++){T.setKeys(['Space']);T.step(33);m=Math.min(m,P.y);}T.setKeys([]);run([],30);return Math.round(968-m);})();
     s.checkpoints.update({x:4300}); P.setPosition(5000,1300); run([],5); R.respawnX=Math.round(P.x);
     R.npcFeet=['julia','lucas','bia','toninho','faisca'].map(n=>[n,Math.round(s[n].y),s[n].originY]);
     R.boundsCache=s.boundsCache;
     return R;})()""")
    print(json.dumps(r,indent=0))
    pg.evaluate("window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape'}))"); time.sleep(1)
    x0=pg.evaluate("window.__controlsTest.getX()"); pg.evaluate("window.__controlsTest.setKeys(['ArrowRight'])"); time.sleep(1.5)
    print("paused", pg.evaluate("window.__game.scene.getScene('vila').paused"), "moved", pg.evaluate("window.__controlsTest.getX()")-x0)
    pg.screenshot(path="/workspace/games-farol/local_shots/m7_pausa.png")
    pg.evaluate("window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape'}))"); time.sleep(0.5)
    print("resumed", not pg.evaluate("window.__game.scene.getScene('vila').paused"))
    print("errs", errs); b.close()
