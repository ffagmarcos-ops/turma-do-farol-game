import sys, time, json
from playwright.sync_api import sync_playwright
url = "http://127.0.0.1:5173/?play"
out="/workspace/games-farol/local_shots/"
pre = sys.argv[1] if len(sys.argv)>1 else "t_"
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader","--autoplay-policy=no-user-gesture-required"])
    pg=b.new_page(viewport={"width":1280,"height":720})
    logs=[]
    pg.on("console", lambda m: logs.append(f"{m.type}: {m.text}") if m.type in("error","warning") else None)
    pg.on("pageerror", lambda e: logs.append(f"PAGEERROR: {e}"))
    pg.goto(url); pg.evaluate("localStorage.clear()"); pg.reload(); time.sleep(5)
    def dbg(): return pg.evaluate("window.__controlsTest && window.__controlsTest.getDebug()")
    def keys(k): pg.evaluate(f"window.__controlsTest.setKeys({json.dumps(k)})")
    shots={"inicio":300,"pier":2600,"vilarejo":5600,"porto":9800,"pier_grande":11800,"fim":13600}
    pg.screenshot(path=out+pre+"inicio.png")
    taken=set(["inicio"]); t0=time.time(); lastx=0; stuck=0; i=0; dialog_shot=False
    while time.time()-t0<420:
        d=dbg(); x=d["x"]; i+=1
        st=d["story"]
        hud=pg.evaluate("(()=>{const s=window.__game.scene.getScene('vila');return {p:s.hud.promptText?.text||'', fin:s.finished, mode:s.story.mode, dlg:!!(s.story.dialogue), sh:s.shellCount, st:s.player.state}})()")
        if hud["fin"]:
            time.sleep(2); pg.screenshot(path=out+pre+"fim.png"); print("FINISHED", x, hud); break
        for n,sx in shots.items():
            if n not in taken and x>=sx and n!="fim": pg.screenshot(path=out+pre+n+".png"); taken.add(n)
        if hud["mode"]!="play" or hud["dlg"]:
            if not dialog_shot and hud["dlg"]: time.sleep(0.6); pg.screenshot(path=out+pre+"dialogo.png"); dialog_shot=True
            keys(["KeyE"]); time.sleep(0.12); keys([]); time.sleep(0.5); continue
        k=["ArrowRight"]
        if 8600<x<8850: k=["ArrowRight","ArrowDown"]
        if abs(x-lastx)<5: stuck+=1
        else: stuck=0
        if stuck>3 or 7150<x<7300: k=k+["Space"]
        keys(k); time.sleep(0.15)
        if i%3==0: keys(["KeyE"]); time.sleep(0.08)
        lastx=x
        if i%20==0: print(round(time.time()-t0), int(x), hud, st)
    print("final", dbg())
    print("\n".join(logs[:30]))
    b.close()
