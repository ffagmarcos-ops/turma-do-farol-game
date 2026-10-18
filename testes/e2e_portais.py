import time, json
from playwright.sync_api import sync_playwright
out="/workspace/games-farol/local_shots/p3_"
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader"]);pg=b.new_page(viewport={"width":1280,"height":720});logs=[]
    pg.on("console", lambda m: logs.append(m.text) if m.type=="error" else None); pg.on("pageerror", lambda e: logs.append("PE "+str(e)))
    shot=lambda n:(pg.wait_for_timeout(350),pg.screenshot(path=out+n))
    G="__game.scene.getScenes(true).map(s=>s.scene.key).join(',')"
    W="JSON.parse(localStorage.getItem('farol-conchas-v2'))"
    pg.goto("http://127.0.0.1:8099/"); pg.evaluate("localStorage.clear(); localStorage.setItem('farol-vila-das-conchas-v4', JSON.stringify({version:4,shells:['s01','s02','s03'],talks:[],story:null,checkpointX:null}))"); pg.reload(); time.sleep(9)
    shot("01_menu_migrado.png"); print("menu", pg.evaluate(G), pg.evaluate(W))
    pg.mouse.click(200,200); time.sleep(1); print("toque fora nao inicia:", pg.evaluate(G))
    pg.keyboard.press("Enter"); time.sleep(2); print("apos jogar:", pg.evaluate(G)); shot("02_intro.png")
    for i in range(3): pg.keyboard.press("Enter"); time.sleep(0.8)
    shot("03_intro_marina.png"); pg.keyboard.press("Enter"); time.sleep(0.8); shot("04_intro_titulo.png"); pg.keyboard.press("Enter"); time.sleep(3)
    print("fase1:", pg.evaluate(G))
    # coleta: teleporta a Marina sobre 10 conchas (2 douradas)
    pg.evaluate("""(()=>{const s=__game.scene.getScene('vila');const ids=['s01','s04','s08','gold-01','s2-001','s2-002','s2-003','s2-004','s2-005','s01'];
      for(const sh of s.shells.getChildren()){ if(ids.includes(sh.getData('id'))) s.collectShell(sh);} })()""")
    time.sleep(0.5); shot("05_f1_gold.png"); print("carteira apos coleta", pg.evaluate(W))
    pg.evaluate("__game.scene.getScene('vila').finishLevel()"); time.sleep(4); print("transicao:", pg.evaluate(G)); shot("06_transicao.png")
    for i in range(8): pg.keyboard.press("Enter"); time.sleep(0.9)
    time.sleep(2.5); shot("07_resumo.png"); print("resumo", pg.evaluate("__game.scene.getScene('transicao-hq').summary"))
    pg.keyboard.press("Enter"); time.sleep(5); print("fase2:", pg.evaluate(G))
    pg.evaluate("__boss.victory()")
    for i in range(400):
        if pg.evaluate("__boss.mode")=="end": break
        pg.evaluate("__boss.confirmPressed=true; for(let k=0;k<10;k++)__boss.step(0.05)")
    shot("08_f2_fim.png"); print("f2 fim", pg.evaluate("__boss.mode"), pg.evaluate(W)["carteira"])
    pg.evaluate("__boss.victory()"); print("bonus 2x?", pg.evaluate(W)["carteira"])
    pg.evaluate("__boss.scene.start('menu')"); time.sleep(2); shot("09_menu_portais.png")
    pg.keyboard.press("p"); time.sleep(3); print("hub:", pg.evaluate(G)); shot("10_hub.png")
    # anda até Marina (x=1120)
    pg.evaluate("__portais.walkTo=__portais.portals.find(p=>p.id==='marina')"); time.sleep(0.3)
    for i in range(30):
        if pg.evaluate("!__portais.walkTo"): break
        time.sleep(0.5)
    print("near", pg.evaluate("__portais.near&&__portais.near.id"), pg.evaluate("Math.round(__portais.player.sprite.x)")); shot("11_hub_perto.png")
    pg.keyboard.press("ArrowUp"); time.sleep(0.6); shot("12_confirm.png"); print("mode", pg.evaluate("[__portais.mode,__portais.focus]"))
    pg.keyboard.press("Enter"); time.sleep(0.6); print("cancelou (foco agora nao):", pg.evaluate("__portais.mode"), pg.evaluate(W)["carteira"])
    pg.keyboard.press("ArrowUp"); time.sleep(0.6); pg.keyboard.press("ArrowLeft"); pg.keyboard.press("Enter"); time.sleep(1.2); shot("13_abrindo.png"); time.sleep(1.0); shot("14_abrindo2.png")
    time.sleep(2.5); shot("15_aberto.png"); print("comprou", pg.evaluate(W))
    pg.keyboard.press("ArrowUp"); time.sleep(2); print("curio:", pg.evaluate(G)); shot("16_curio1.png")
    pg.keyboard.press("ArrowRight"); time.sleep(0.6); shot("17_curio2.png"); pg.keyboard.press("ArrowRight"); time.sleep(0.6); shot("18_curio3.png")
    pg.keyboard.press("Escape"); time.sleep(2.5); print("volta:", pg.evaluate(G), pg.evaluate("__portais.near&&__portais.near.id"))
    pg.keyboard.press("Tab"); time.sleep(0.8); pg.keyboard.press("ArrowRight"); time.sleep(0.4); shot("19_lista.png")
    pg.keyboard.press("Escape"); time.sleep(0.5)
    # toque no portal do mezanino (farol): caminho automático
    pg.evaluate("__portais.tapPortal(__portais.portals.find(p=>p.id==='farol'))")
    for i in range(60):
        if pg.evaluate("!__portais.walkTo"): break
        time.sleep(0.5); shot("20_mezanino.png")
    print("mez", pg.evaluate("[Math.round(__portais.player.sprite.x),Math.round(__portais.player.sprite.y),__portais.mode, __portais.near&&__portais.near.id]"))
    print("errors", logs[:10]); b.close()
