import sys, time, json
from playwright.sync_api import sync_playwright
out="/workspace/games-farol/local_shots/"
BOT = r"""
window.__bot = window.__bot || {talked:{}, t:0, stuck:0, lastx:0, log:[], e:false};
window.__botTick = (n) => {
  const s = window.__game.scene.getScene('vila'); const B = window.__bot; const T = window.__controlsTest;
  for (let i=0;i<n;i++){
    B.t++;
    const x = s.player.x; const st = s.story;
    const prompt = s.hud.prompt.visible ? s.hud.prompt.text : '';
    const dlg = st.dialogue || st.caption || (s.talk.active ? 1 : 0) || s.hud.dialogueText.visible;
    let keys = [];
    if (s.finished) { T.setKeys([]); return {done:true,x}; }
    if (st.mode !== 'play' || dlg) {
      if (B.t % 8 === 0) keys = ['KeyE'];
      if (s.hud.dialogueText.visible) { const k=(s.hud.dialogueText.text||'').slice(0,60); if(!B.log.includes(k)) B.log.push(k); }
      if (st.caption) { const k='[leg] '+String(st.caption).slice(0,60); if(!B.log.includes(k)) B.log.push(k); }
    } else if (prompt.startsWith('E') && !B.talked[prompt+Math.round(x/500)]) {
      B.talked[prompt+Math.round(x/500)] = 1; keys = ['KeyE'];
    } else if (prompt.startsWith('A Faísca ainda')) { keys = []; }
    else {
      keys = ['ArrowRight'];
      if (x > 8560 && x < 9060) keys.push('ArrowDown');
      if (Math.abs(x - B.lastx) < 0.5) B.stuck++; else B.stuck = 0;
      if ((x > 7150 && x < 7290) || B.stuck > 20) { if (B.t%20<10) keys.push('Space'); }
      if (x < 8560 || x > 9060) keys.push('ShiftLeft');
    }
    B.lastx = x;
    T.setKeys(keys); T.step(33);
  }
  const s2=s; return {x:Math.round(s2.player.x), y:Math.round(s2.player.y), mode:s2.story.mode, story:s2.story.snapshot(), shells:s2.shellCount, prompt:s2.hud.prompt.visible?s2.hud.prompt.text:'', fin:s2.finished};
};
"""
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader"])
    pg=b.new_page(viewport={"width":960,"height":540})
    logs=[]
    pg.on("console", lambda m: logs.append(f"{m.type}: {m.text}") if m.type=="error" else None)
    pg.on("pageerror", lambda e: logs.append(f"PAGEERROR: {e}"))
    pg.goto("http://127.0.0.1:8099/?play"); pg.evaluate("localStorage.clear()"); pg.reload(); time.sleep(5)
    pg.evaluate(BOT)
    marks={"inicio":500,"rua":2700,"mercado":5150,"fonte":6950,"porto":9900,"grande_pier":11800}
    lastsh=0; shshots=0
    taken=set(); dshot=0; fshot=False
    for it in range(1500):
        r=pg.evaluate("window.__botTick(30)")
        if r.get("done"):
            time.sleep(2.5); pg.screenshot(path=out+"f1fx_fim.png"); print("FIM", r)
            pg.wait_for_function("!!window.__game.scene.getScene('vila').endButtons", timeout=60000); time.sleep(1.0); pg.evaluate("window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyC'}))"); pg.wait_for_function("window.__game.scene.isActive('boss-polvo')", timeout=60000); time.sleep(4)
            print("CONTINUAR->", pg.evaluate("window.__game.scene.getScenes(true).map(s=>s.scene.key)"))
            pg.screenshot(path=out+"f1fx_continuar_fase2.png"); break
        if r["shells"]>lastsh and shshots<2: shshots+=1; pg.screenshot(path=out+f"f1fx_concha_{shshots}.png")
        lastsh=r["shells"]
        if r["story"]["artifact"] and not getattr(sys,"_g",0): sys._g=1; time.sleep(0.5); pg.screenshot(path=out+"f1fx_concha_dourada.png")
        for k,v in marks.items():
            if k not in taken and r["x"]>=v: taken.add(k); time.sleep(0.8); pg.screenshot(path=out+"f1fx_"+k+".png")
        vis=pg.evaluate("window.__game.scene.getScene('vila').hud.dialogueText.visible")
        if vis and dshot<12: dshot+=1; time.sleep(0.8); pg.screenshot(path=out+f"f1fx_dialogo_{dshot}.png")
        fd=pg.evaluate("(()=>{const s=window.__game.scene.getScene('vila');return Math.abs(s.faisca.x-s.player.x)})()")
        if not fshot and fd<160 and r["x"]>1500: fshot=True; time.sleep(0.8); pg.screenshot(path=out+"p_faisca_marina.png")
        if it%10==0: print(it, r)
    print("LOG", json.dumps(pg.evaluate("window.__bot.log"), ensure_ascii=False, indent=0))
    print("\n".join(logs[:20])); b.close()
