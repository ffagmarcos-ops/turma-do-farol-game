using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolIslandMechanics : MonoBehaviour
    {
        [Serializable] public sealed class Helper
        {
            public string id,kind;public Rect zone;public Animator npc;public Transform crate;public Vector2 start,target;public Transform[] platforms;public Vector3[] origins;public float[] sinks;
            public bool active,finished;public float elapsed,cycle,flashAt=-1;[NonSerialized] public JObject data;
        }
        public TextAsset map;public List<Helper> helpers=new List<Helper>();
        public bool completed;public int flashCount;public string hint;public float hintUntil;
        FarolPlayerController player;FarolCompanion companion;FarolCampaign campaign;FarolIslandArt art;FarolSourceMarker[] markers;JObject level;
        readonly Dictionary<string,SpriteRenderer> covers=new Dictionary<string,SpriteRenderer>();
        readonly Dictionary<string,JObject> definitions=new Dictionary<string,JObject>();
        readonly HashSet<string> detours=new HashSet<string>();float specialCooldown;GameObject chargeFx;public float Cooldown=>specialCooldown;
        public string SectorName=>level==null?"":(string)level["sectors"].LastOrDefault(s=>(float)s["x0"]/100<=player.transform.position.x)?["name"]??"Ilha";
        void Start()
        {
            player=FindFirstObjectByType<FarolPlayerController>();companion=FindFirstObjectByType<FarolCompanion>();campaign=GetComponent<FarolCampaign>();art=GetComponent<FarolIslandArt>();markers=FindObjectsByType<FarolSourceMarker>(FindObjectsSortMode.None);level=JObject.Parse(map.text);
            foreach(var chunk in level["chunks"]){foreach(JObject t in chunk["triggers"]??new JArray()){if(t["id"]!=null)definitions[(string)t["id"]]=t;string kind=(string)t["event"];if(kind=="helpZoneMarina"||kind=="helpZoneLucas"||kind=="helpZoneJulia"||kind=="helpZoneBia")BuildHelper(t,kind);}
                foreach(JObject s in chunk["secrets"]??new JArray())BuildSecret(s,(string)chunk["sector"]);
            }
            foreach(var m in markers.Where(m=>m.category=="relics"||m.category=="energyOrbs"))BuildCollectible(m);
            player.Interrupted+=CancelCharge;
        }
        static float F(JToken t,string key,float fallback=0)=>(float?)t[key]??fallback;
        static Vector2 Point(JToken t,string x="x",string y="y")=>FarolCoordinates.Point(F(t,x),F(t,y));
        public static Rect Zone(JToken d)=>new Rect(F(d,"x")/100,(1080-F(d,"y")-F(d,"h"))/100,F(d,"w")/100,F(d,"h")/100);
        FarolSourceMarker Marker(string category,string id)=>markers.FirstOrDefault(m=>m.category==category&&m.sourceId==id);
        Transform Matching(string category,JToken d)=>markers.FirstOrDefault(m=>m.category==category&&Mathf.Abs(m.transform.position.x-(F(d,"x")+F(d,"w")/2)/100)<.03f)?.transform;
        void BuildHelper(JObject d,string kind)
        {
            string id=(string)d["id"];var npc=Marker("helper",id);var h=new Helper{id=id,kind=kind,zone=Zone(d),data=d,npc=npc?npc.GetComponent<Animator>():null,cycle=2.25f};
            FarolIslandArt.Play(h.npc,kind=="helpZoneMarina"?"marina.idle":kind=="helpZoneLucas"?"lucas.idle":"julia.idle");
            h.finished=kind!="helpZoneJulia"&&FarolGameSession.Instance.EventSeen("helper:"+id);h.active=h.finished;h.elapsed=h.finished?3:0;
            if(kind=="helpZoneMarina"){
                h.start=Point(d,"crateStartX","crateStartY");h.target=Point(d,"crateTargetX","crateTargetY");var go=art.Visual("Caixa da Marina — "+id,"crate",h.finished?h.target:h.start,1.28f,1.28f,18,parent:transform);h.crate=go.transform;
                // Arte com pivô central; a coordenada original representa a base da caixa.
                h.crate.position+=(Vector3)Vector2.up*.64f;
                var box=go.AddComponent<BoxCollider2D>();box.size=new Vector2(1.28f/go.transform.localScale.x,.24f/go.transform.localScale.y);box.offset=Vector2.up*(.52f/go.transform.localScale.y);box.usedByEffector=true;go.AddComponent<PlatformEffector2D>().useOneWay=true;var rb=go.AddComponent<Rigidbody2D>();rb.bodyType=RigidbodyType2D.Kinematic;
                PositionMarina(h,h.finished?h.start:h.start);if(h.finished)FarolIslandArt.Play(h.npc,"marina.finish");
            }
            if(kind=="helpZoneLucas"||kind=="helpZoneBia"){
                var defs=(JArray)d[kind=="helpZoneLucas"?"buoys":"secretPlatforms"];h.platforms=defs.Select(p=>Matching(kind=="helpZoneLucas"?"buoy":"platforms",p)).ToArray();h.origins=h.platforms.Select(t=>t?t.position:Vector3.zero).ToArray();h.sinks=new float[h.platforms.Length];
                for(int i=0;i<h.platforms.Length;i++){if(!h.platforms[i])throw new InvalidOperationException("Plataforma da ajuda ausente: "+id);var mover=h.platforms[i].GetComponent<FarolMovingPlatform>();if(mover)mover.enabled=false;SetPlatform(h.platforms[i],h.finished);}
            }
            helpers.Add(h);
        }
        void PositionMarina(Helper h,Vector2 boxBase){if(h.npc){int dir=h.target.x<h.start.x?-1:1;h.npc.transform.position=new Vector3(boxBase.x-dir*.82f,h.start.y,0);h.npc.GetComponent<SpriteRenderer>().flipX=dir<0;}}
        static void SetPlatform(Transform t,bool value){foreach(var r in t.GetComponentsInChildren<Renderer>())r.enabled=value;foreach(var c in t.GetComponents<Collider2D>())c.enabled=value;}
        void BuildSecret(JObject d,string sector)
        {
            string id=(string)d["id"];definitions["secret:"+id]=d;var cover=d["cover"];var source=markers.Where(m=>m.category=="decor"&&m.sector==sector).OrderBy(m=>Mathf.Abs(m.transform.position.x-Point(cover).x)).FirstOrDefault();if(!source)return;
            var sr=source.GetComponent<SpriteRenderer>();if(!sr||!sr.sprite)return;var go=new GameObject("Cobertura do segredo — "+id);go.transform.SetParent(transform,false);go.transform.position=FarolCoordinates.RectCenter(F(cover,"x"),F(cover,"y"),F(cover,"w"),F(cover,"h"));var r=go.AddComponent<SpriteRenderer>();r.sprite=sr.sprite;r.sortingOrder=32;go.transform.localScale=new Vector3(F(cover,"w")/100/r.sprite.bounds.size.x,F(cover,"h")/100/r.sprite.bounds.size.y,1);covers[id]=r;if(FarolGameSession.Instance.EventSeen("secret:"+id))r.color=new Color(1,1,1,.15f);
        }
        void BuildCollectible(FarolSourceMarker m)
        {
            bool relic=m.category=="relics";var go=art.Visual(relic?"Relíquia da ilha":"Orbe de recarga",relic?"artifact":"island_orb",m.transform.position,.65f,.65f,23,parent:transform);
            go.layer=2;var box=go.AddComponent<BoxCollider2D>();box.isTrigger=true;var collect=go.AddComponent<FarolIslandCollectible>();collect.id=m.sourceId;collect.relic=relic;collect.island=this;
        }
        void Update()
        {
            if(level==null){UnityEngine.SceneManagement.SceneManager.LoadScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene().path);return;}if(!player||Time.timeScale==0||completed)return;float dt=Time.deltaTime;specialCooldown=Mathf.Max(0,specialCooldown-dt);Vector2 pos=player.transform.position;
            foreach(var h in helpers){bool inside=h.zone.Contains(pos);if(!h.active&&inside&&(h.kind!="helpZoneBia"||player.grounded&&Mathf.Abs(player.GetComponent<Rigidbody2D>().linearVelocity.x)<.25f))TriggerHelper(h);if(h.kind=="helpZoneBia"&&h.active&&!h.finished&&h.elapsed>1){h.active=false;h.elapsed=0;}if(!h.active)continue;h.elapsed+=dt;
                if(h.kind=="helpZoneMarina"&&!h.finished)UpdateCrate(h);
                else if(h.kind=="helpZoneLucas")UpdateBuoys(h,dt);
                else if(h.kind=="helpZoneJulia"){
                    if(!inside&&h.flashAt<0){h.cycle=2.25f;continue;}h.cycle+=dt;if(h.flashAt<0&&h.cycle>=F(h.data,"interval",3.1f)){h.flashAt=h.elapsed;h.cycle=0;FarolIslandArt.Play(h.npc,"julia.flash");}
                    if(h.flashAt>=0&&h.elapsed-h.flashAt>=.375f){Flash(h);h.flashAt=-1;}
                }
            }
            foreach(var pair in covers){var d=definitions["secret:"+pair.Key];if(Zone(d["zone"]).Contains(pos)&&!FarolGameSession.Instance.EventSeen("secret:"+pair.Key)){FarolGameSession.Instance.RememberEvent("secret:"+pair.Key);pair.Value.color=new Color(1,1,1,.15f);Tell("Passagem secreta descoberta!");}if(d["sniffX"]?.Type!=JTokenType.Null&&d["sniffX"]!=null&&Mathf.Abs(pos.x-F(d,"sniffX")/100)<1.1f&&!FarolGameSession.Instance.EventSeen("secret:"+pair.Key))Tell("Faísca farejou uma passagem. Explore e tente agachar.",2);}
            foreach(var m in markers.Where(m=>m.category=="hints")){if(Mathf.Abs(pos.x-m.transform.position.x)<1.2f){var d=JObject.Parse(m.originalJson);Tell(((string)d["text"]??"").Replace("{jump}","Espaço").Replace("{move}","A/D").Replace("{up}","↑").Replace("{run}","Shift").Replace("{attack}","Z").Replace("{special}","X").Replace("{down}","S"),2);}}
            foreach(var d in definitions.Values.Where(d=>(string)d["event"]=="faiscaDetour"))if(companion&&Zone(d).Contains(pos)&&detours.Add((string)d["id"]))companion.Detour(Point(d,"pathX","pathY"),Point(d,"reunionX","reunionY"));
            foreach(var d in definitions.Values.Where(d=>(string)d["event"]=="fase3Finale"))if(Zone(d).Contains(pos)){Finish();break;}
            foreach(var m in markers.Where(m=>m.category=="waterfalls")){var r=m.GetComponent<SpriteRenderer>();if(r)r.color=new Color(1,1,1,Mathf.Abs(pos.x-m.transform.position.x)<2?.38f:.8f);}
        }
        public void TriggerHelper(Helper h)
        {
            if(h.active)return;h.active=true;h.elapsed=0;
            if(h.kind=="helpZoneMarina"){FarolIslandArt.Play(h.npc,"marina.prepare");Tell("Marina vai empurrar a caixa para ajudar na subida.");}
            if(h.kind=="helpZoneLucas"){FarolIslandArt.Play(h.npc,"lucas.assemble");Tell("Lucas está ativando as plataformas flutuantes.");}
            if(h.kind=="helpZoneBia"){if(!player.Discover(()=>{if(!h.finished){h.finished=true;Remember(h);foreach(var t in h.platforms)SetPlatform(t,true);Tell("Bia descobriu o caminho nas copas!");}})){h.active=false;return;}Tell("Bia está investigando a pista...");}
        }
        void UpdateCrate(Helper h)
        {
            if(h.elapsed<.48f)return;FarolIslandArt.PlayIfChanged(h.npc,"marina.push");
            float elapsed=h.elapsed-.48f,pushTime=Mathf.Abs(h.target.x-h.start.x)/1.85f;Vector2 basePos=h.start;basePos.x=Mathf.MoveTowards(h.start.x,h.target.x,1.85f*elapsed);
            if(elapsed<pushTime)PositionMarina(h,basePos);else{float fall=elapsed-pushTime;basePos.y=Mathf.Max(h.target.y,h.start.y-.8f*fall-11*fall*fall);}
            h.crate.GetComponent<Rigidbody2D>().MovePosition(basePos+Vector2.up*.64f);
            if(Vector2.Distance(basePos,h.target)<.01f){h.finished=true;Remember(h);FarolIslandArt.Play(h.npc,"marina.finish");Tell("A caixa está no lugar. Pule nela para alcançar o patamar.");}
        }
        void Remember(Helper h){FarolGameSession.Instance.RememberEvent("helper:"+h.id);}
        void UpdateBuoys(Helper h,float dt)
        {
            if(!h.finished&&h.elapsed>=1){h.finished=true;Remember(h);FarolIslandArt.Play(h.npc,"lucas.ready");Tell("As boias surgiram. Pule para atravessar o riacho.");}
            if(!h.finished)return;var defs=(JArray)h.data["buoys"];
            for(int i=0;i<h.platforms.Length;i++){
                var t=h.platforms[i];bool ready=h.elapsed>=1+i*.18f||h.elapsed==0;SetPlatform(t,ready);if(!ready)continue;float top=h.origins[i].y+.29f;bool on=player.grounded&&Mathf.Abs(player.transform.position.x-h.origins[i].x)<F(defs[i],"w",168)/200+.2f&&Mathf.Abs(player.transform.position.y-t.GetComponent<Collider2D>().bounds.max.y)<.3f;
                h.sinks[i]=Mathf.MoveTowards(h.sinks[i],on?F(defs[i],"sinkDepth",22)/100:0,dt*(on?.95f:.75f));Vector3 next=h.origins[i]+Vector3.up*(Mathf.Sin(Time.time*2.1f+i*1.15f)*F(defs[i],"oscAmp",8)/100-h.sinks[i]);t.GetComponent<Rigidbody2D>().MovePosition(next);
            }
        }
        public void Flash(Helper h)
        {
            flashCount++;float x=F(h.data,"juliaX")/100,r=F(h.data,"flashRadius",1080)/100;foreach(var enemy in FindObjectsByType<FarolEnemy>(FindObjectsSortMode.None))if(enemy.monkey&&(Mathf.Abs(enemy.transform.position.x-x)<r||enemy.transform.position.x>=h.zone.xMin-1.6f&&enemy.transform.position.x<=h.zone.xMax+1.6f))enemy.Stun(F(h.data,"stunDuration",2.2f));foreach(var stone in FindObjectsByType<FarolIslandStone>(FindObjectsSortMode.None))if(Mathf.Abs(stone.transform.position.x-x)<r)Destroy(stone.gameObject);
            var fx=art.Visual("Flash da Júlia","camera_flash/f000",new Vector2(x+.3f,(1080-F(h.data,"juliaY"))/100+1.3f),1.1f,1.1f,40,"camera_flash.play",transform);if(PlayerPrefs.GetInt("farol.unity.reduceFlash",0)==1)fx.GetComponent<SpriteRenderer>().color=new Color(1,1,1,.25f);Destroy(fx,.22f);campaign.Sfx("sfx_ui_confirm",.25f);
        }
        public void Tell(string text,float duration=5){hint=text;hintUntil=Time.time+duration;}
        public void Charge(float value){if(companion)companion.Action(value>=1?"faisca.charged":"faisca.charge",.1f);if(!chargeFx)chargeFx=art.Visual("Carga do latido","bark_wave/f000",player.transform.position,.5f,1,28,parent:transform);chargeFx.transform.position=(companion?companion.transform.position:player.transform.position)+Vector3.up*.5f;chargeFx.transform.localScale=Vector3.one*(.12f+value*.15f);}
        public void CancelCharge(){if(chargeFx)Destroy(chargeFx);chargeFx=null;}
        public bool CanBark=>specialCooldown<=0;
        public void Recharge(){specialCooldown=0;Tell("Latido do Faísca recarregado!");}
        public bool FireBark()
        {
            if(!CanBark)return false;CancelCharge();specialCooldown=3.5f;if(companion)companion.Action("faisca.bark",.4f);int dir=player.facing;Vector2 origin=companion&&Vector2.Distance(companion.transform.position,player.transform.position)<2.6f?(Vector2)companion.transform.position:(Vector2)player.transform.position;origin+=Vector2.up*.5f;
            var wave=art.Visual("Onda do latido","bark_wave/f000",origin,.7f,1.6f,29,"bark_wave.play",transform);wave.GetComponent<SpriteRenderer>().flipX=dir<0;var travel=wave.AddComponent<FarolIslandWave>();travel.direction=dir;
            foreach(var e in FindObjectsByType<FarolEnemy>(FindObjectsSortMode.None)){float dx=(e.transform.position.x-origin.x)*dir;if(dx>-.8f&&dx<7.8f&&Mathf.Abs(e.transform.position.y-origin.y)<(e.monkey?4.2f:3.2f))e.Defeat();}
            foreach(var w in FindObjectsByType<FarolBreakable>(FindObjectsSortMode.None)){float dx=(w.transform.position.x-origin.x)*dir;if(dx>-.8f&&dx<7.8f&&Mathf.Abs(w.transform.position.y-origin.y)<3.2f)w.Break();}campaign.Sfx("sonic_charged",.5f);return true;
        }
        public GameObject Warning(Vector2 aim){var go=art.Visual("Aviso de pedra","shell",aim+Vector2.up*.05f,.8f,.15f,14,parent:transform);go.GetComponent<SpriteRenderer>().color=new Color(.1f,.06f,0,.6f);return go;}
        public void ThrowStone(Vector2 start,Vector2 target){float flight=.85f;var go=art.Visual("Pedra do macaco","stone_projectile/f000",start,.38f,.38f,24,"stone.spin",transform);go.layer=2;go.AddComponent<FarolIslandStone>().velocity=(target+Vector2.up*.5f-start)/flight+Vector2.up*(9*flight);}
        public void Finish()
        {
            if(completed)return;completed=true;CancelCharge();player.Lock(true);FarolGameSession.Instance.RememberEvent("fase3-concluida");string[] sheets={"toninho_rope","marina_push","lucas_device","julia_camera"},poses={"toninho.confirm","marina.finish","lucas.ready","julia.idle"};for(int i=0;i<4;i++)art.Visual("Celebração — "+sheets[i],sheets[i]+"/f000",(Vector2)player.transform.position+Vector2.left*(.9f+i*.85f),order:18,pose:poses[i],parent:transform);if(companion)companion.Action("faisca.bark",3);campaign.ShowIslandVictory();
        }
        void OnDestroy(){if(player)player.Interrupted-=CancelCharge;}
    }
    public sealed class FarolIslandWave : MonoBehaviour
    {
        public int direction;float age;void Update(){age+=Time.deltaTime;transform.position+=Vector3.right*direction*12.5f*Time.deltaTime;var sr=GetComponent<SpriteRenderer>();sr.color=new Color(1,1,1,1-age/.62f);if(age>=.62f)Destroy(gameObject);}
    }
}
