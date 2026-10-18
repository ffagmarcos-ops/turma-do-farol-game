import sys, time
from playwright.sync_api import sync_playwright
out="/workspace/games-farol/local_shots/"; pre=sys.argv[1]; xs=[int(a) for a in sys.argv[2:]]
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader"])
    pg=b.new_page(viewport={"width":960,"height":540})
    logs=[]
    pg.on("console", lambda m: logs.append(f"{m.type}: {m.text}") if m.type in("error","warning") else None)
    pg.on("pageerror", lambda e: logs.append(f"PAGEERROR: {e}"))
    pg.goto("http://127.0.0.1:8099/?play"); pg.evaluate("localStorage.clear()"); pg.reload(); time.sleep(5)
    for x in xs:
        pg.evaluate(f"(()=>{{const s=window.__game.scene.getScene('vila');s.player.sprite.setPosition({x},900);s.player.sprite.setVelocity(0,0);s.cameras.main.scrollX=Math.max(0,{x}-700);}})()")
        time.sleep(2.5); pg.screenshot(path=f"{out}{pre}{x}.png")
    print("\n".join(logs[:20])); b.close()
