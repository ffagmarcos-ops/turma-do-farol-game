exec(open('/tmp/ck_common.py').read())
import sys
PORT=int(sys.argv[1]) if len(sys.argv)>1 else 8099
R={}
with sync_playwright() as p:
    b,pg,logs=open_page(p); wait_scene(pg,"menu"); time.sleep(3); pg.mouse.click(30,30); time.sleep(5)
    R["menu"]=pg.evaluate("__game.registry.get('audio').musicFile")
    pg.evaluate("__game.scene.getScene('menu').enterPortais()"); wait_scene(pg,"portais"); time.sleep(12)
    R["hub"]=pg.evaluate("__game.registry.get('audio').musicFile")
    pg.evaluate("__game.scene.getScenes(true)[0].scene.start('boss-polvo',{segment:0})"); wait_scene(pg,"boss-polvo"); time.sleep(15)
    pg.evaluate("__boss.seq && (__boss.seq.skipAll=true, __boss.skipSequence())"); time.sleep(3)
    pg.evaluate("__boss.mode='fight';__boss.invuln=0;__boss.phase=3;__boss.hp=800;__boss.damageBoss(150,960,500,false)"); time.sleep(4)
    R["tense"]=pg.evaluate("[!!__boss.baud.tense, __boss.baud.gMain.gain.value, __boss.baud.gTense&&__boss.baud.gTense.gain.value, __boss.baud.pick('music_tense')&&Math.round(__boss.baud.pick('music_tense').duration)]")
    pg.evaluate("__boss.invuln=0;__boss.hp=150;__boss.damageBoss(60,960,500,false)"); time.sleep(4)
    R["fury"]=pg.evaluate("[!!__boss.finalReady, !!__boss.baud.fury, __boss.baud.gTense&&__boss.baud.gTense.gain.value, __boss.baud.gFury&&__boss.baud.gFury.gain.value, !!__boss.baud.drumT, __boss.baud.pick('music_fury')&&Math.round(__boss.baud.pick('music_fury').duration)]")
    R["logs"]=logs; print(json.dumps(R)); b.close()
