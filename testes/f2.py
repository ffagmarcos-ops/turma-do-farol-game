import sys, time, json
from playwright.sync_api import sync_playwright
out="/workspace/games-farol/local_shots/"
JS_HELP = """
window.__kd=(c)=>window.dispatchEvent(new KeyboardEvent('keydown',{code:c}));
window.__ku=(c)=>window.dispatchEvent(new KeyboardEvent('keyup',{code:c}));
window.__run=(sec, opts={})=>{const B=window.__boss; if(!B) return 'nob'; const n=Math.round(sec/0.033);
 for(let i=0;i<n;i++){ if(opts.confirm && B.mode==='seq' && i%6==0) B.confirmPressed=true;
   if(opts.fight && B.mode==='fight'){ // bot: atira (toque/segura), evita faixa do tentáculo
     const t=(i%40); if(t==0) __kd('KeyJ'); if(t==(opts.charge?38:3)) __ku('KeyJ');
     const L=B.lucasP; const danger=B.tentacles.find(x=>x.active&&['warn','rise','raised','strike'].includes(x.state));
     let goal=960; if(B.wave) goal=1290; const sw=B.tentacles.find(x=>x.state==='sweep'); if(sw&&Math.abs(sw.tip.x-L.x)<260){ if(sw.high) __kd('ArrowDown'); else __kd('ArrowUp'); } else __ku('ArrowUp'); if(B.inks.some(k=>k.on&&Math.abs(k.tx-L.x)<120)) goal=L.x<960?L.x+260:L.x-260;
     __ku('ArrowLeft');__ku('ArrowRight'); if(L.x<goal-30) __kd('ArrowRight'); else if(L.x>goal+30) __kd('ArrowLeft');
     if(B.wave&&Math.abs(L.x-1290)<150) __kd('ArrowDown'); else if(!sw) __ku('ArrowDown');
   }
   B.step(0.033); if(opts.until && opts.until(B)) return 'until@'+i; if(window.__boss!==B) return 'scene-changed'; }
 return B.mode+' hp='+Math.round(B.hp)+' phase='+B.phase+' L='+B.lucasP.hp+' ko='+B.lucasP.koCount;};
"""
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader","--autoplay-policy=no-user-gesture-required"])
    pg=b.new_page(viewport={"width":1280,"height":720})
    logs=[]
    pg.on("console", lambda m: logs.append(f"{m.type}: {m.text}") if m.type in ("error","warning") else None)
    pg.on("pageerror", lambda e: logs.append(f"PAGEERROR: {e}"))
    pg.goto("http://127.0.0.1:8099/?boss=0"); pg.evaluate("localStorage.clear()"); pg.reload(); time.sleep(7)
    pg.evaluate(JS_HELP)
    r=lambda s,o="{}": pg.evaluate(f"__run({s},{o})")
    def shot(n): pg.wait_for_timeout(250); pg.screenshot(path=out+n)
    print(r(1.5)); shot("f2_00_titulo.png")
    print(r(2.0,"{confirm:false}")); shot("f2_01_dialogo.png")
    print(r(40,"{confirm:true, until:B=>B.mode==='fight'}")); shot("f2_02_inicio_luta.png")
    print(r(6,"{until:B=>B.tentacles.some(t=>t.state==='warn'&&t.t>0.5)}")); shot("f2_03_tentaculo_aviso.png")
    print(r(1.2)); shot("f2_04_tentaculo_golpe.png")
    pg.evaluate("__boss.storm.lightning(true)"); pg.evaluate("__boss.step(0.03)"); shot("f2_05_raio.png")
    # dano no Lucas
    pg.evaluate("__boss.lucasP.iframes=0; __boss.hurtLucas(1, 1500)"); pg.evaluate("__run(0.15)"); shot("f2_06_lucas_dano.png")
    pg.evaluate("__boss.lucasP.iframes=0; __boss.lucasP.hp=10; __boss.hurtLucas(1, 1500)"); pg.evaluate("__run(0.6)"); shot("f2_07_lucas_ko.png")
    print(r(2.0)); shot("f2_08_lucas_levanta.png")
    print(pg.evaluate("[__boss.lucasP.hp, __boss.lucasP.ko, __boss.lucasP.koCount, __boss.mode]"))
    # luta automática até a fase B (tinta)
    print(r(120,"{fight:true, confirm:true, until:B=>B.phase>=1&&B.mode==='fight'}")); 
    print(r(30,"{fight:true, confirm:true, until:B=>B.inks.some(i=>i.on)}")); pg.evaluate("__run(0.3)"); shot("f2_09_tinta.png")
    print(r(240,"{fight:true, confirm:true, charge:true, until:B=>B.phase>=3&&B.mode==='fight'}")); shot("f2_10_barra_25.png")
    print(r(240,"{fight:true, confirm:true, charge:true, until:B=>B.finalReady||B.mode!=='fight'&&B.seq&&B.seq.steps[0].panel==='cut_p0'}")); shot("f2_11_final.png")
    print(r(60,"{fight:true, confirm:true, charge:true, until:B=>B.mode==='end'}")); shot("f2_12_vitoria.png")
    print(pg.evaluate("[__boss.lucasP.koCount, Math.round(__boss.clock), __boss.game.loop.actualFps]"))
    print("LOGS:", "\n".join(logs[:30]))
    b.close()
