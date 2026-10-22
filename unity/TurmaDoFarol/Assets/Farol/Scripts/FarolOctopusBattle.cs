using System;
using System.Collections.Generic;
using UnityEngine;
using Newtonsoft.Json.Linq;
namespace TurmaDoFarol
{
    public sealed class FarolOctopusBattle:MonoBehaviour
    {
        public FarolCampaignAssets assets;public FarolCampaign campaign;
        public Transform boat,octopus,lucas;
        public SpriteRenderer body,eyes,mouth,sky;
        public SpriteRenderer[] tentacleImages;
        public float hp=2400,playerHP=100,heat,overheat;
        public int phase;
        public bool suspended,won,finalReady;
        [NonSerialized] public float testMove;[NonSerialized] public bool testJump,testControls,testFire,testDown;
        public float Charge=>charge;
        public string Objective=>won?"O Esperança está a salvo!":ko>0?"Lucas vai se levantar · vidas infinitas":finalReady?"SEGURE o sônico e solte o tiro carregado!":exposed>0?"Olhos expostos! Acerte o ponto fraco":"Desvie dos ataques e atire nas ventosas";
        public float x=960,y=700;
        float vx,vy,clock,charge,hold,cool,heatIdle,ko,invincible,bossInvincible,attackTimer=2,exposed,hurtFlash,transition;
        bool grounded=true,crouching,fireWas,jumpWas;int facing=1,patternIndex;
        float bob,angle,lightning=7,waveTimer=-1,inkWind=-1,puddleSlow;
        int waveStage,waveDirection=1;float waveWarn;
        readonly List<Shot> shots=new List<Shot>();readonly List<Ink> inks=new List<Ink>();readonly List<Puddle> puddles=new List<Puddle>();
        Tentacle[] tentacles;
        FarolFlipbook lucasAnim;SpriteRenderer lucasImage;
        string currentAnim="";
        string[][] patterns={new[]{"L","R","L","R"},new[]{"L","R","ink","R","L","ink"},new[]{"L","R","sweep","ink","R","L","wave"},new[]{"LR","ink","sweep","LR","mast","ink","wave","LR"}};
        class Shot {public Vector2 p,v;public bool charged;public float life;public SpriteRenderer image;}
        class Ink {public Vector2 from;public float target,t,duration;public SpriteRenderer image,mark;}
        class Puddle {public float x,life;public SpriteRenderer image;}
        public sealed class Tentacle {public int side;public string kind,state="idle";public float t,x,target,window,damage,stun;public int hits;public bool high;public Vector2 tip;public SpriteRenderer image;}
        JObject Config=>assets.Data["boss"] as JObject;
        JToken Phase=>Config["phases"][phase];
        public void Begin(int checkpoint)
        {
            phase=Mathf.Clamp(checkpoint,0,3);hp=2400-phase*600;playerHP=100;clock=0;attackTimer=3;
            tentacles=new[]{new Tentacle{side=-1,image=tentacleImages[0]},new Tentacle{side=1,image=tentacleImages[1]}};
            lucasAnim=lucas.GetComponent<FarolFlipbook>();lucasImage=lucas.GetComponent<SpriteRenderer>();
            campaign.BossDialogue("entrada");
        }
        static Vector3 World(float x,float y)=>new Vector3(x/100,(1080-y)/100,0);
        public float DeckY(float px)=>700+bob+Mathf.Tan(angle*Mathf.Deg2Rad)*(px-960);
        void Update()
        {
            if(campaign==null||tentacles==null||suspended||campaign.paused||Time.timeScale==0)return;
            float dt=Mathf.Min(Time.deltaTime,.05f);clock+=dt;
            bob=Mathf.Sin(clock*1.96f)*6;angle=Mathf.Sin(clock*1.5f)*(phase==3?2.2f:.8f);
            boat.position=World(960,700+bob);boat.rotation=Quaternion.Euler(0,0,-angle);
            octopus.position=World(960+Mathf.Sin(clock*.7f)*30,420+Mathf.Sin(clock*1.1f)*14);
            octopus.localScale=new Vector3(1+Mathf.Sin(clock*1.8f)*.018f,1-Mathf.Sin(clock*1.8f)*.022f,1);
            body.color=hurtFlash>0?new Color(1,.65f,.65f):phase==3?new Color(1,.75f,.75f):Color.white;hurtFlash=Mathf.Max(0,hurtFlash-dt);
            eyes.sprite=assets.Sprite("f2_polvo_olhos",hurtFlash>0?4:exposed>0?3:phase==3?2:Mathf.Repeat(clock,4)<.14f?1:0);
            mouth.sprite=assets.Part("f2_polvo_partes",exposed>0?"mouthStun":phase==3||inkWind>=0?"mouthAngry":"mouthNeutral");
            if(won){octopus.position+=Vector3.down*clock*.015f;return;}
            UpdateLucas(dt);UpdateShots(dt);UpdateInks(dt);
            invincible=Mathf.Max(0,invincible-dt);bossInvincible=Mathf.Max(0,bossInvincible-dt);exposed=Mathf.Max(0,exposed-dt);
            foreach(var t in tentacles)UpdateTentacle(t,dt);
            if(transition>0){transition-=dt;return;}
            if(ko<=0&&!finalReady){attackTimer-=dt;if(attackTimer<=0&&!Busy()){LaunchAttack();attackTimer=(float)Phase["interval"];}}
            if(inkWind>=0){inkWind+=dt;if(inkWind>1.1f){SpitInk();inkWind=-1;}}
            UpdateWave(dt);
            lightning-=dt;if(lightning<=0){lightning=7+UnityEngine.Random.value*6;campaign.Sfx("fase2/trovao_longo",.5f);}
            sky.color=PlayerPrefs.GetInt("farol.unity.reduceFlash",0)==0&&lightning<.12f?new Color(1.25f,1.25f,1.25f):Color.white;
            campaign.Prompt(ko>0?"Lucas se recuperando…":finalReady?"Tiro CARREGADO nos olhos!":waveTimer>=0&&waveStage==0?"ONDA! Abaixe-se junto ao mastro à direita":inkWind>=0?"TINTA! Saia da marca no convés":Warning());
        }
        bool Busy(){foreach(var t in tentacles)if(t.state!="idle"&&t.state!="vulnerable"&&t.state!="stunned"&&t.state!="retract")return true;return waveTimer>=0||inkWind>=0;}
        string Warning(){foreach(var t in tentacles)if(t.state=="warn")return t.kind=="sweep"?(t.high?"VARREDURA ALTA · abaixe-se":"VARREDURA BAIXA · pule"):t.kind=="mast"?"MASTRO! Três tiros carregados na ventosa":t.side<0?"TENTÁCULO À ESQUERDA · afaste-se":"TENTÁCULO À DIREITA · afaste-se";return exposed>0?"PONTO FRACO EXPOSTO · atire nos olhos":"";}
        void UpdateLucas(float dt)
        {
            invincible=Mathf.Max(0,invincible);cool=Mathf.Max(0,cool-dt);overheat=Mathf.Max(0,overheat-dt);
            if(ko>0){ko-=dt;SetLucasAnim("lucas_ko",Range(0,15),8,false);if(ko<=0){playerHP=100;heat=0;invincible=2;attackTimer=3;campaign.Prompt("Vida cheia!");}}
            else {
                float input=testControls?testMove:testMove!=0?testMove:(Input.GetKey(KeyCode.D)||Input.GetKey(KeyCode.RightArrow)?1:0)-(Input.GetKey(KeyCode.A)||Input.GetKey(KeyCode.LeftArrow)?1:0);
                crouching=(testControls?testDown:Input.GetKey(KeyCode.S)||Input.GetKey(KeyCode.DownArrow))&&grounded;
                float desired=input*(crouching?140:400)*(cool>0?.7f:1);bool slippery=false;foreach(var p in puddles)if(Mathf.Abs(x-p.x)<100&&p.life>0)slippery=true;
                vx=Mathf.Lerp(vx,desired,Mathf.Min(1,dt*(slippery?1.2f:14)));x=Mathf.Clamp(x+vx*dt,260,1610);if(input!=0)facing=input>0?1:-1;
                bool jump=Input.GetKey(KeyCode.W)||Input.GetKey(KeyCode.UpArrow)||Input.GetKey(KeyCode.K)||testJump;
                if(jump&&!jumpWas&&grounded){vy=-1120;grounded=false;campaign.Sfx("sfx_jump");}jumpWas=jump;testJump=false;
                bool fire=testControls?testFire:Input.GetKey(KeyCode.J)||Input.GetKey(KeyCode.E)||Input.GetKey(KeyCode.Space)||Input.GetKey(KeyCode.X)||Input.GetMouseButton(0)&&!PointerOverUI();
                if(fire&&overheat<=0){if(!fireWas&&cool<=0){Fire(false);heat+=8;cool=.25f;heatIdle=0;}hold+=dt;if(hold>.3f)charge=Mathf.Min(1.2f,charge+dt);}
                else {if(fireWas&&charge>=1.2f&&overheat<=0){Fire(true);heat+=40;}hold=0;charge=0;heatIdle+=dt;if(heatIdle>.4f)heat=Mathf.Max(0,heat-35*dt);}
                fireWas=fire;
                if(heat>=100&&overheat<=0){heat=100;overheat=1.8f;charge=0;campaign.Sfx("fase2/madeira_impacto_01",.5f);}
                if(overheat>0&&overheat<=dt*1.1f)heat=60;
                string pose=invincible>1&&playerHP<100?"hurt":charge>.05f?"charge":!grounded?(vy<0?"jump":"fall"):crouching?"crouch":cool>.08f?"shoot":Mathf.Abs(vx)>50?"run":"idle";
                SetLucasPose(pose);
            }
            float floor=DeckY(x);float roof=700+bob-.22f*(assets.Sprite("f2_barco").rect.height*1500/assets.Sprite("f2_barco").rect.width);
            if(x>315&&x<720&&y<=roof+6&&!(crouching&&jumpWas))floor=roof;
            if(!grounded){vy+=2600*dt;y+=vy*dt;if(y>=floor&&vy>=0){y=floor;vy=0;grounded=true;}}
            else if(y<floor-8)grounded=false;else y=floor;
            lucas.position=World(x,y);lucas.rotation=Quaternion.Euler(0,0,-angle);lucasImage.flipX=facing<0;
            lucasImage.color=invincible>0&&Mathf.Sin(clock*35)>0?new Color(1,.5f,.5f):new Color(.85f,.92f,1);
        }
        bool PointerOverUI()=>campaign.paused||campaign.dialogueOpen;
        static int[] Range(int a,int b){var v=new int[b-a+1];for(int i=0;i<v.Length;i++)v[i]=a+i;return v;}
        void SetLucasPose(string p){if(p==currentAnim)return;currentAnim=p;int[] seq=p=="run"?Range(8,15):p=="shoot"?Range(16,21):p=="charge"?Range(44,47):p=="crouch"?new[]{32,33}:p=="jump"?new[]{33}:p=="fall"?new[]{32}:p=="hurt"?new[]{40,41}:Range(0,3);lucasAnim.Set("f2_lucas_sonic",seq,p=="run"?12:p=="shoot"?18:8,p!="shoot");}
        void SetLucasAnim(string key,int[] f,float fps,bool loop){if(currentAnim==key)return;currentAnim=key;lucasAnim.Set(key,f,fps,loop);}
        public void Fire(bool charged)
        {
            if(won||ko>0||suspended)return;
            Vector2 target=new Vector2(960,330);float distance=float.MaxValue;
            foreach(var t in tentacles)if(t.state!="idle"&&t.state!="retract"&&t.state!="warn"){float d=Vector2.Distance(new Vector2(x,y-150),t.tip);if(d<distance){distance=d;target=t.tip;}}
            if(exposed>0||finalReady)target=new Vector2(960+(x<960?-178:178),365);
            facing=target.x>=x?1:-1;var from=new Vector2(x+facing*50,y-150);var direction=(target-from).normalized;
            var image=MakeImage("Sônico",assets.Sprite("f2_sonic_fx",charged?8:0),40);image.transform.position=World(from.x,from.y);image.transform.localScale=Vector3.one*(charged?.9f:.55f);image.transform.rotation=Quaternion.Euler(0,0,-Mathf.Atan2(direction.y,direction.x)*Mathf.Rad2Deg);
            shots.Add(new Shot{p=from,v=direction*(charged?1500:1700),charged=charged,life=1.2f,image=image});campaign.Sfx(charged?"sonic_charged":"sonic",charged?.8f:.55f);
        }
        void UpdateShots(float dt)
        {
            for(int i=shots.Count-1;i>=0;i--){var s=shots[i];s.p+=s.v*dt;s.life-=dt;s.image.transform.position=World(s.p.x,s.p.y);s.image.sprite=assets.Sprite("f2_sonic_fx",(s.charged?8:0)+Mathf.FloorToInt(clock*18)%6);bool hit=false;float r=s.charged?110:70;
                for(int j=inks.Count-1;j>=0;j--){var ink=inks[j];Vector2 ip=InkPosition(ink);if(Vector2.Distance(s.p,ip)<r){RemoveInk(j,false);if(!s.charged)hit=true;}}
                if(!hit)foreach(var t in tentacles){if(t.state=="idle"||t.state=="retract"||t.state=="warn")continue;if(Vector2.Distance(s.p,t.tip)>r+50)continue;hit=true;
                    float mult=t.state=="stunned"?1.5f:t.state=="vulnerable"||t.state=="hold"?1:.25f;
                    if(t.kind=="mast"&&t.state=="hold"){if(s.charged)t.hits++;if(t.hits>=3){t.state="retract";t.t=0;exposed=4;}}
                    else if(t.state=="vulnerable"){t.damage+=(s.charged?36:12)*mult;if(s.charged||t.damage>=(float)Phase["stun"][0]){t.state="stunned";t.t=0;t.stun=(float)Phase["stun"][1];exposed=t.stun;}}
                    DamageBoss((s.charged?36:12)*mult,s.charged);break;
                }
                if(!hit&&s.p.y<540&&Mathf.Abs(s.p.x-960)<410){hit=true;float mult=exposed>0||finalReady?2:.25f;DamageBoss((s.charged?36:12)*mult,s.charged);}
                if(hit||s.life<=0){Destroy(s.image.gameObject);shots.RemoveAt(i);}
            }
        }
        public void DamageBoss(float amount,bool charged)
        {
            if(won||suspended||bossInvincible>0||finalReady&&!charged)return;
            if(finalReady&&charged){hp=0;Win();return;}
            hp=Mathf.Max(0,hp-amount);hurtFlash=.18f;
            campaign.Sfx("fase2/madeira_impacto_02",charged?.7f:.3f);
            if(hp<=2400*.28f)campaign.Tension(true);
            if(phase<3&&hp<=(3-phase)*600){hp=(3-phase)*600;phase++;patternIndex=0;campaign.progress.bossPhase=phase;campaign.Store();playerHP=Mathf.Min(100,playerHP+30);RetractAll();transition=1.5f;bossInvincible=2;campaign.BossDialogue(phase==1?"p75":phase==2?"p50":"p25");attackTimer=2;}
            if(phase==3&&hp<=120&&!finalReady){hp=120;finalReady=true;exposed=99;RetractAll();}
        }
        public void Hurt(float amount,float from)
        {
            if(won||suspended||invincible>0||ko>0)return;playerHP=Mathf.Max(0,playerHP-amount);invincible=1;vx=x<from?-400:400;vy=-360;grounded=false;charge=0;campaign.Sfx("fase2/barco_pancada_01",.6f);
            if(playerHP<=0){ko=2;RetractAll();attackTimer=3.4f;currentAnim="";}
        }
        void LaunchAttack()
        {
            var pattern=patterns[phase];string kind=pattern[patternIndex++%pattern.Length];
            if(kind=="ink"){inkWind=0;return;}if(kind=="wave"){waveTimer=0;waveStage=0;waveWarn=2;waveDirection=patternIndex%2==0?1:-1;return;}
            if(kind=="sweep"){StartTentacle(tentacles[0],"sweep",false);StartTentacle(tentacles[1],"sweep",true);return;}
            if(kind=="mast"){StartTentacle(tentacles[1],"mast",false);return;}
            if(kind=="L"||kind=="LR")StartTentacle(tentacles[0],"lane",false);if(kind=="R"||kind=="LR")StartTentacle(tentacles[1],"lane",false);
        }
        void StartTentacle(Tentacle t,string kind,bool high){t.kind=kind;t.state="warn";t.t=high?-.9f:0;t.high=high;t.damage=0;t.hits=0;t.target=kind=="mast"?1410:t.side<0?460:1460;t.x=t.target;t.window=(float)Phase["window"];t.image.enabled=true;}
        void UpdateTentacle(Tentacle t,float dt)
        {
            if(t.state=="idle"){t.image.enabled=false;return;}t.t+=dt;
            float top=1050;string state=t.state;
            if(state=="warn"){top=1050-Mathf.Max(0,t.t)*45;if(t.t>=(float)Phase["warn"]){t.state="rise";t.t=0;}}
            else if(state=="rise"){top=Mathf.Lerp(1050,340,Mathf.Clamp01(t.t/.3f));if(t.t>.3f){t.state=t.kind=="sweep"?"sweep":t.kind=="mast"?"hold":"strike";t.t=0;}}
            else if(state=="strike"){top=Mathf.Lerp(340,DeckY(t.x)-40,Mathf.Clamp01(t.t/.18f));if(t.t>=.18f){if(Mathf.Abs(x-t.x)<210)Hurt(20,t.x);t.state="vulnerable";t.t=0;campaign.Sfx("fase2/barco_pancada_02",.7f);}}
            else if(state=="sweep"){top=DeckY(x)-(t.high?190:45);t.x=Mathf.Lerp(t.side<0?160:1760,t.side<0?1760:160,Mathf.Clamp01(t.t/1.3f));if(Mathf.Abs(x-t.x)<110&&(t.high?!crouching:grounded))Hurt(20,t.x);if(t.t>1.3f){t.state="vulnerable";t.t=0;}}
            else if(state=="hold"){top=420;if(t.t>12){t.state="retract";t.t=0;waveTimer=0;waveStage=0;waveWarn=1.2f;}}
            else if(state=="vulnerable"||state=="stunned"){top=DeckY(t.x)-110+Mathf.Sin(clock*6)*8;if(t.t>(state=="stunned"?t.stun:t.window)){t.state="retract";t.t=0;}}
            else if(state=="retract"){top=Mathf.Lerp(DeckY(t.x)-100,1100,Mathf.Clamp01(t.t/.45f));if(t.t>.45f)t.state="idle";}
            bool sweep=t.kind=="sweep"&&state=="sweep";
            t.image.sprite=sweep?assets.Sprite("f2_tent_varr",Mathf.FloorToInt(clock*12)%6):assets.Part("f2_tent_est",state=="strike"?"strike":state=="stunned"||state=="vulnerable"?"stunned":"normal");
            t.image.drawMode=SpriteDrawMode.Simple;t.image.flipX=t.side>0;
            float desired=sweep?450:state=="vulnerable"||state=="stunned"?330:Mathf.Max(160,1050-top);
            var size=t.image.sprite.bounds.size;t.image.transform.localScale=new Vector3((sweep?800:330)/100/size.x,desired/100/size.y,1);
            t.image.transform.position=World(t.x,top+desired/2);t.image.color=state=="warn"?new Color(1,.8f,.5f,.5f):state=="vulnerable"||state=="stunned"?new Color(1,.8f,1):Color.white;
            t.tip=new Vector2(t.x,top+desired*.48f);
        }
        void UpdateWave(float dt){if(waveTimer<0)return;waveTimer+=dt;bool safe=crouching&&Mathf.Abs(x-1410)<170;
            if(waveStage==0&&waveTimer>=waveWarn){waveStage=1;waveTimer=0;campaign.Sfx("fase2/mar_onda_01",.9f);if(!safe)Hurt(phase==3?40:20,waveDirection>0?1900:0);}
            else if(waveStage==1){if(!safe)x=Mathf.Clamp(x-waveDirection*120*dt,260,1610);if(waveTimer>1.5f){waveTimer=-1;foreach(var t in tentacles){StartTentacle(t,"lane",false);t.state="vulnerable";t.window=2;}}}}
        void SpitInk(){int count=phase==3?5:3;for(int i=0;i<count;i++){float target=Mathf.Clamp(x+(i-(count-1)/2f)*160,270,1600);var image=MakeImage("Tinta",assets.Sprite("f2_tinta",0),35);image.transform.localScale=Vector3.one*.65f;var mark=MakeImage("Marca de tinta",assets.Sprite("shell"),22);mark.color=new Color(.65f,.1f,.85f,.7f);mark.transform.localScale=Vector3.one*.35f;mark.transform.position=World(target,DeckY(target));inks.Add(new Ink{from=new Vector2(960,480),target=target,t=-i*.18f,duration=.8f,image=image,mark=mark});}}
        Vector2 InkPosition(Ink i){float u=Mathf.Clamp01(i.t/i.duration);return Vector2.Lerp(i.from,new Vector2(i.target,DeckY(i.target)-20),u)+Vector2.up*(-Mathf.Sin(u*Mathf.PI)*420);}
        void UpdateInks(float dt){for(int i=inks.Count-1;i>=0;i--){var ink=inks[i];ink.t+=dt;ink.image.transform.position=World(InkPosition(ink).x,InkPosition(ink).y);if(ink.t>=ink.duration){if(Mathf.Abs(x-ink.target)<80)Hurt(20,ink.target);RemoveInk(i,true);}}
            for(int i=puddles.Count-1;i>=0;i--){var p=puddles[i];p.life-=dt;p.image.transform.position=World(p.x,DeckY(p.x)+8);p.image.color=new Color(.2f,.03f,.35f,Mathf.Min(.75f,p.life));if(p.life<=0){Destroy(p.image.gameObject);puddles.RemoveAt(i);}}}
        void RemoveInk(int index,bool puddle){var ink=inks[index];Destroy(ink.image.gameObject);Destroy(ink.mark.gameObject);inks.RemoveAt(index);if(puddle){var image=MakeImage("Poça escorregadia",assets.Sprite("f2_tinta",0),21);image.transform.localScale=new Vector3(1.1f,.12f,1);puddles.Add(new Puddle{x=ink.target,life=6,image=image});campaign.Sfx("fase2/splash_01",.4f);}}
        SpriteRenderer MakeImage(string name,Sprite sprite,int order){var go=new GameObject(name);go.transform.SetParent(transform,false);var sr=go.AddComponent<SpriteRenderer>();sr.sprite=sprite;sr.sortingOrder=order;return sr;}
        void RetractAll(){if(tentacles!=null)foreach(var t in tentacles){t.state="retract";t.t=0;}waveTimer=-1;inkWind=-1;for(int i=inks.Count-1;i>=0;i--)RemoveInk(i,false);}
        void Win(){won=true;RetractAll();campaign.Sfx("sfx_bell");campaign.BossDialogue("vitoria",()=>campaign.Won());}
    }
}
