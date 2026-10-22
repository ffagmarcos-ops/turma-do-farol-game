using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UIElements;
using Newtonsoft.Json.Linq;
namespace TurmaDoFarol
{
    public sealed partial class FarolCampaign : MonoBehaviour
    {
        public FarolCampaignAssets assets;
        public string stage="menu";
        public Transform world;
        public FarolVillagePlayer player;
        public FarolOctopusBattle battle;
        public Transform dog;
        public Vector2 checkpoint=new Vector2(4.2f,1.12f);
        public string menuScene="Menu_Campanha",villageScene="Fase1_Vila",bossScene="Fase2_Polvo",islandScene,portalsScene="Portais_Farol";
        [Serializable] public class Progress {public List<string> shells=new List<string>();public int wallet;public float checkpoint=4.2f;public bool artifact,toninho,boarded,bossDone,introSeen;public int bossPhase;public bool bonusF2,islandStarted,arriveIsland;public string resumeStage="village";public List<string> doors=new List<string>(),seen=new List<string>(),islandShells=new List<string>();}
        public Progress progress;
        public bool paused,dialogueOpen;
        public string Objective=>!progress.artifact?"Siga a Faísca até o Cais de Pesca":!progress.toninho?"Mostre o artefato ao Seu Toninho":"Suba no Esperança";
        const string SaveKey="farol.unity.campanha.v1";
        VisualElement ui;AudioSource music,effects,ambience,tense;float musicVolume=.6f,effectsVolume=.8f;
        JArray lines;int lineIndex;Action finished;float dialogueElapsed;
        bool tenseOn; FarolCampaignShell[] villageShells; Transform artifact;
        readonly Dictionary<string,AudioClip> synthesized=new Dictionary<string,AudioClip>();
        readonly Dictionary<string,Transform> characters=new Dictionary<string,Transform>();
        void Start()
        {
            Time.timeScale=1;Physics2D.IgnoreLayerCollision(8,8,true);
            try{progress=JsonUtility.FromJson<Progress>(PlayerPrefs.GetString(SaveKey,""));}catch{progress=null;}
            if(progress==null)progress=new Progress();if(progress.shells==null)progress.shells=new List<string>();
            NormalizeProgress();
            musicVolume=PlayerPrefs.GetFloat("farol.unity.music",.6f);effectsVolume=PlayerPrefs.GetFloat("farol.unity.effects",.8f);
            AudioListener.volume=PlayerPrefs.GetInt("farol.unity.mute",0)==1?0:1;
            music=gameObject.AddComponent<AudioSource>();music.loop=true;effects=gameObject.AddComponent<AudioSource>();ambience=gameObject.AddComponent<AudioSource>();ambience.loop=true;tense=gameObject.AddComponent<AudioSource>();tense.loop=true;
            var doc=GetComponent<UIDocument>();ui=doc.rootVisualElement;
            BindUI();BindPortals();BindMenuVisuals();
            if(stage=="menu"){Show("menu",true);Music("menu/musica_menu");}
            else {
                Show("hud",true);Show("controls",true);Show("bossHud",stage=="boss");
                if(stage=="village") {
                    villageShells=world.GetComponentsInChildren<FarolCampaignShell>(true);artifact=world.Find("Artefato");
                    checkpoint=new Vector2(progress.checkpoint,1.12f);player.campaign=this;player.Teleport(checkpoint);
                    foreach(var f in world.GetComponentsInChildren<FarolFlipbook>())characters[f.character]=f.transform;
                    Music("music_vila");LoopAmbience("amb_waves",.12f);RefreshShells();
                    if(!progress.introSeen)Dialogue((JArray)assets.Data["hq"]["intro"],()=>{progress.introSeen=true;Store();});
                }else if(stage=="portals"){if(GetComponent<FarolPortalHall>()){Show("portalsList",true);Label("stage","Portais do Farol");Label("objective","Explore o salão e o mezanino");Label("controls","A/D: andar · Espaço: pular · E: portal · Tab: lista · Esc: pausa");}else OpenPortals();if(OpenListOnArrival){OpenListOnArrival=false;OpenPortals();}Music("menu/musica_mistica");}
                else if(stage=="island"){StartIsland();Music("music_vila");}
                else {battle.campaign=this;battle.Begin(progress.bossDone?0:progress.bossPhase);Music("fase2/bgm_boss");LoopAmbience("fase2/chuva_loop",.10f);if(progress.bossDone&&!progress.islandStarted)Won();}
            }
        }
        void BindUI()
        {
            Click("play",StartFromMenu);
            Click("continue",ContinueAdventure);Click("bossTest",()=>Load(bossScene));
            Click("island",()=>Load(portalsScene));Click("pausePortals",()=>Load(portalsScene));
            Click("sound",()=>OpenSound(true));Click("pauseSound",()=>OpenSound(false));Click("closeSound",CloseSound);
            Click("pauseButton",TogglePause);Click("resume",TogglePause);Click("mainMenu",()=>Load(menuScene));
            Click("next",AdvanceDialogue);Click("skip",EndDialogue);Click("replayBoss",()=>{if(stage=="island"){ReplayIsland();return;}progress.bossPhase=0;Store();Load(bossScene);});Click("victoryMenu",()=>Load(menuScene));
            Click("cancelNew",()=>{Show("confirm",false);ui.Q<Button>("play").Focus();});Click("acceptNew",StartNew);
            var mv=ui.Q<Slider>("musicVolume");mv.SetValueWithoutNotify(musicVolume);mv.RegisterValueChangedCallback(e=>{musicVolume=e.newValue;PlayerPrefs.SetFloat("farol.unity.music",musicVolume);});
            var ev=ui.Q<Slider>("effectsVolume");ev.SetValueWithoutNotify(effectsVolume);ev.RegisterValueChangedCallback(e=>{effectsVolume=e.newValue;PlayerPrefs.SetFloat("farol.unity.effects",effectsVolume);});
            var mute=ui.Q<Toggle>("mute");mute.SetValueWithoutNotify(AudioListener.volume==0);mute.RegisterValueChangedCallback(e=>{AudioListener.volume=e.newValue?0:1;PlayerPrefs.SetInt("farol.unity.mute",e.newValue?1:0);});
            var rf=ui.Q<Toggle>("reduceFlashes");rf.SetValueWithoutNotify(PlayerPrefs.GetInt("farol.unity.reduceFlash",0)==1);rf.RegisterValueChangedCallback(e=>PlayerPrefs.SetInt("farol.unity.reduceFlash",e.newValue?1:0));
        }
        void Click(string id,Action action){ui.Q<Button>(id).clicked+=()=>{Sfx("sfx_ui_confirm",.4f);action();if(id=="pauseButton"||id=="resume")ui.focusController?.focusedElement?.Blur();};}
        void Show(string id,bool visible){ui.Q(id).EnableInClassList("hidden",!visible);}
        bool soundFromMenu;
        void OpenSound(bool menu){soundFromMenu=menu;Show("settings",true);ui.Q<Button>("closeSound").Focus();}
        void CloseSound(){Show("settings",false);PlayerPrefs.Save();ui.Q<Button>(soundFromMenu?"sound":"pauseSound").Focus();}
        public void Load(string scene){if(scene==villageScene)progress.resumeStage="village";else if(scene==bossScene)progress.resumeStage="boss";else if(scene==islandScene)progress.resumeStage="island";Store();Time.timeScale=1;SceneManager.LoadScene(scene);}
        void StartNew(){progress=new Progress{wallet=progress.wallet,doors=progress.doors,seen=progress.seen};Store();Load(villageScene);}
        public void Store(){PlayerPrefs.SetString(SaveKey,JsonUtility.ToJson(progress));PlayerPrefs.Save();}
        public void TogglePause(){if(stage=="menu"||dialogueOpen)return;paused=!paused;Time.timeScale=paused?0:1;Show("pause",paused);if(!paused)ui.focusController?.focusedElement?.Blur();}
        public void Music(string key){var c=assets.Audio(key);if(c){music.clip=c;music.Play();}}
        void LoopAmbience(string key,float volume){ambience.clip=assets.Audio(key);ambience.volume=volume;if(ambience.clip)ambience.Play();}
        public void Sfx(string key,float volume=1){if(!effects)return;var c=assets.Audio(key);if(!c&&(key=="sonic"||key=="sonic_charged")){if(!synthesized.TryGetValue(key,out c)){int rate=22050;float duration=key=="sonic"?.18f:.42f;var samples=new float[(int)(rate*duration)];for(int i=0;i<samples.Length;i++){float t=(float)i/rate,u=t/duration,f=key=="sonic"?1100-700*u:600-400*u;samples[i]=Mathf.Sin(2*Mathf.PI*f*t)*Mathf.Sin(Mathf.PI*u)*.22f;}c=AudioClip.Create(key,samples.Length,1,rate,false);c.SetData(samples,0);synthesized[key]=c;}}if(c)effects.PlayOneShot(c,volume*effectsVolume);}
        public void Tension(bool value){if(tenseOn==value)return;tenseOn=value;if(value){tense.clip=assets.Audio("fase2/bgm_boss_tenso");if(tense.clip)tense.Play();}}
        void Update()
        {
            if(!EnsureMenuInterface())return;
            if(Input.GetKeyDown(KeyCode.M)){AudioListener.volume=AudioListener.volume==0?1:0;PlayerPrefs.SetInt("farol.unity.mute",AudioListener.volume==0?1:0);ui.Q<Toggle>("mute").SetValueWithoutNotify(AudioListener.volume==0);}
            music.volume=Mathf.MoveTowards(music.volume,musicVolume*(dialogueOpen?.35f:stage=="boss"?.28f:1)*(tenseOn?0:1),Time.unscaledDeltaTime*.2f);
            tense.volume=Mathf.MoveTowards(tense.volume,tenseOn?musicVolume*.28f:0,Time.unscaledDeltaTime*.2f);
            UpdatePortalHold();
            if(Input.GetKeyDown(KeyCode.Escape)){if(CloseMenuOverlay())return;if(ClosePortalOverlay())return;TogglePause();}
            if(dialogueOpen){dialogueElapsed+=Time.unscaledDeltaTime;if(dialogueElapsed>.2f&&(Input.GetKeyDown(KeyCode.E)||(!(ui.focusController.focusedElement is Button)&&(Input.GetKeyDown(KeyCode.Return)||Input.GetKeyDown(KeyCode.Space)))))AdvanceDialogue();return;}
            if(stage=="menu"){MenuShortcuts();return;}if(paused)return;
            if(stage=="village")UpdateVillage();else if(stage=="boss")UpdateBossHud();else if(stage=="island")UpdateIsland();else if(stage=="portals")Label("shells",$"Carteira: {progress.wallet} conchas");
        }
        void UpdateVillage()
        {
            Label("stage","Vila das Conchas");Label("objective",Objective);Label("shells",$"Conchas: {progress.shells.Count}/120   ·   Carteira: {progress.wallet}");
            Label("controls","A/D ou setas: andar   ·   Shift: correr   ·   Espaço: pular   ·   S: agachar   ·   E: conversar   ·   Esc: pausa");
            float x=player.transform.position.x;
            foreach(var cp in new[]{42f,87f,123f})if(x>=cp&&progress.checkpoint<cp){progress.checkpoint=cp;checkpoint=new Vector2(cp,1.12f);Store();Sfx("sfx_bell",.4f);}
            if(dog){float target=progress.toninho?113.8f:progress.artifact?95.8f:Mathf.Min(95.8f,x+2.2f);var p=dog.position;p.x=Mathf.MoveTowards(p.x,target,3.2f*Time.deltaTime);dog.GetComponent<SpriteRenderer>().flipX=target<p.x;dog.GetComponent<FarolFlipbook>().Play(Mathf.Abs(target-p.x)>.1f?"run":"idle");dog.position=p;}
            foreach(var s in villageShells)if(s.gameObject.activeSelf&&Vector2.Distance(s.transform.position,player.transform.position+Vector3.up*.8f)<.72f)Collect(s);
            var npc=NearestInteraction();Prompt(npc==null?"":"E · "+InteractionLabel(npc));
            if(Input.GetKeyDown(KeyCode.E)&&npc!=null)Interact(npc);
            if(artifact)artifact.gameObject.SetActive(progress.artifact);
            if(progress.toninho){foreach(var who in new[]{"julia","lucas","bia"})if(characters.TryGetValue(who,out var t)){float tx=(float)assets.Data["village"]["actors"][who]["gatherX"]/100;t.position=Vector3.MoveTowards(t.position,new Vector3(tx,1.12f,0),2*Time.deltaTime);}}
        }
        public string NearestInteraction(){float x=player.transform.position.x;var a=assets.Data["village"]["actors"];foreach(var who in new[]{"toninho","bia","lucas","julia"}){float nx=characters.TryGetValue(who,out var t)?t.position.x:(float)a[who]["x"]/100;if(Mathf.Abs(x-nx)<1.9f)return who;}if(Mathf.Abs(x-136.4f)<2)return "boat";return null;}
        string InteractionLabel(string npc)=>npc=="boat"?(progress.toninho?"Embarcar no Esperança":"O Esperança · fale com Seu Toninho"):npc=="bia"?"Conversar com Bia":npc=="toninho"?"Conversar com Seu Toninho":npc=="lucas"?"Conversar com Lucas":"Conversar com Júlia";
        public void Interact(string npc)
        {
            if(dialogueOpen)return;
            string id=npc=="julia"?"julia_porto":npc=="lucas"?"lucas_praca":npc=="bia"?(progress.artifact?"bia_depois":"bia_redes"):npc=="toninho"?(progress.artifact?progress.toninho?"toninho_embarcar":"toninho_artefato":"toninho_bom_dia"):null;
            if(npc=="boat"){if(progress.toninho)Board();return;}
            var data=assets.Data["dialogues"][id]["lines"] as JArray;
            string[] panels=id=="bia_redes"?new[]{"P02_Q01","P02_Q02","P02_Q03","P02_Q03","P02_Q04","P02_Q04"}:id=="toninho_artefato"?new[]{"P02_Q05","P03_Q01","P03_Q01","P03_Q02","P03_Q02","P03_Q02","P03_Q03","P03_Q03","P03_Q04","P03_Q04","P04_Q01","P04_Q02","P04_Q02","P04_Q03","P04_Q03","P04_Q04","P04_Q04","P04_Q05","P05_Q04","P05_Q04","P05_Q04"}:new[]{"P01_Q01"};
            var copied=new JArray();for(int i=0;i<data.Count;i++){var line=(JObject)data[i].DeepClone();line["img"]="hq_"+panels[Mathf.Min(i,panels.Length-1)];copied.Add(line);}
            Dialogue(copied,()=>{if(id=="bia_redes"){progress.artifact=true;Sfx("sfx_clinc");}if(id=="toninho_artefato")progress.toninho=true;Store();});
        }
        public void Board(){if(!progress.toninho)return;progress.boarded=true;if(!progress.doors.Contains("mar"))progress.doors.Add("mar");Store();Dialogue((JArray)assets.Data["hq"]["transicao"],()=>Load(bossScene));}
        public void Collect(FarolCampaignShell shell){if(progress.shells.Contains(shell.id))return;progress.shells.Add(shell.id);progress.wallet+=shell.gold?5:1;shell.gameObject.SetActive(false);Sfx("sfx_shell",.7f);Store();}
        void RefreshShells(){foreach(var s in world.GetComponentsInChildren<FarolCampaignShell>(true))s.gameObject.SetActive(!progress.shells.Contains(s.id));}
        public void Dialogue(JArray sequence,Action onDone){lines=sequence;lineIndex=0;finished=onDone;dialogueOpen=true;if(player){player.locked=true;player.GetComponent<Rigidbody2D>().linearVelocity=Vector2.zero;}if(battle)battle.suspended=true;Prompt("");Show("hq",true);PresentLine();ui.Q<Button>("next").Focus();}
        void PresentLine(){if(lines==null||lineIndex>=lines.Count){EndDialogue();return;}dialogueElapsed=0;var line=lines[lineIndex];string who=(string)(line["who"]??line["speaker"])??"";Label("speaker",Name(who));Label("speech",(string)line["text"]);string art=(string)line["img"]??"hq_P08_Q05";var image=ui.Q<UnityEngine.UIElements.Image>("panelArt");var entry=assets.Find(art);image.image=entry?.texture;image.scaleMode=ScaleMode.ScaleToFit;SetFramedBackdrop("hqBackdrop",entry?.texture);}
        public void AdvanceDialogue(){if(!dialogueOpen)return;lineIndex++;PresentLine();}
        public void EndDialogue(){if(!dialogueOpen)return;dialogueOpen=false;Show("hq",false);if(player)player.locked=false;if(battle)battle.suspended=false;ui.focusController?.focusedElement?.Blur();var cb=finished;finished=null;cb?.Invoke();}
        static string Name(string s){switch(s){case "marina":return "Marina";case "bia":return "Bia";case "julia":return "Júlia";case "lucas":return "Lucas";case "toninho":return "Seu Toninho";case "faisca":return "Faísca";case "narrador":return "";default:return s;}}
        public void BossDialogue(string key,Action callback=null){var sequence=assets.Data["bossDialogues"][key] as JArray;if(sequence==null){callback?.Invoke();return;}var copy=(JArray)sequence.DeepClone();foreach(var l in copy)l["img"]="cut_"+key;Dialogue(copy,callback);}
        void UpdateBossHud(){Label("stage","Mar aberto · O Polvo Gigante");Label("objective",battle.Objective);Label("shells",$"Carteira: {progress.wallet} conchas");Label("controls","A/D: andar   ·   W ou ↑: pular   ·   S: agachar   ·   J/E/Espaço: sônico (segure e solte para carregar)   ·   Esc: pausa");Label("bossLabel",$"Polvo · Etapa {"ABCD"[battle.phase]} · {Mathf.CeilToInt(battle.hp)}/2400");ui.Q<ProgressBar>("bossLife").value=battle.hp/24;ui.Q<ProgressBar>("lucasLife").value=battle.playerHP;Label("lucasLabel",$"Lucas · {Mathf.CeilToInt(battle.playerHP)}/100");ui.Q<ProgressBar>("heat").value=battle.heat;ui.Q<ProgressBar>("heat").title="Aquecimento";Label("charge",battle.overheat>0?"Superaquecido · aguarde":battle.Charge>=1.2f?"Carga pronta · solte para disparar":$"Carga: {Mathf.RoundToInt(battle.Charge/1.2f*100)}%");}
        public void Won(){progress.bossDone=true;if(!progress.doors.Contains("ilha"))progress.doors.Add("ilha");progress.bossPhase=0;if(!progress.bonusF2){progress.wallet+=30;progress.bonusF2=true;}Store();Dialogue((JArray)assets.Data["bossEnding"],GoIsland);}
        void GoIsland(){progress.islandStarted=true;progress.arriveIsland=true;Load(islandScene);}
        void ContinueAdventure(){if(progress.bossDone&&!progress.islandStarted){Load(bossScene);return;}Load(progress.resumeStage=="island"?islandScene:progress.resumeStage=="village"?villageScene:progress.resumeStage=="boss"||progress.boarded?bossScene:villageScene);}
        public void Prompt(string text){if(ui==null)return;Label("prompt",text);Show("prompt",!string.IsNullOrEmpty(text));}
        void Label(string id,string text){var l=ui.Q<Label>(id);if(l.text!=text)l.text=text;}
        void OnDestroy(){Time.timeScale=1;}
    }
}
