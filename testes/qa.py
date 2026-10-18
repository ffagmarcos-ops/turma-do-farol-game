import sys, time
from playwright.sync_api import sync_playwright
url = sys.argv[1] if len(sys.argv)>1 else "http://127.0.0.1:5173/"
out="/workspace/games-farol/local_shots/"
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader","--autoplay-policy=no-user-gesture-required"])
    pg=b.new_page(viewport={"width":1280,"height":720})
    logs=[]
    pg.on("console", lambda m: logs.append(f"{m.type}: {m.text}"))
    pg.on("pageerror", lambda e: logs.append(f"PAGEERROR: {e}"))
    pg.goto(url); time.sleep(6)
    pg.screenshot(path=out+"00_check.png")
    print("\n".join(logs[:40]))
    b.close()
