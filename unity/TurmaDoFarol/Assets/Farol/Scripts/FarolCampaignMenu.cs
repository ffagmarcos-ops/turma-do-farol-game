using System;
using System.Linq;
using UnityEngine;
using UnityEngine.UIElements;
namespace TurmaDoFarol
{
    public sealed partial class FarolCampaign
    {
        public static bool OpenListOnArrival;
        void BindMenuVisuals()
        {
            Click("menuList",()=>{OpenListOnArrival=true;Load(portalsScene);});
            Click("creditsButton",OpenCredits);Click("closeCredits",CloseCredits);
            foreach(string id in new[]{"hqFrame","curiosityFrame"}){var frame=ui.Q<UnityEngine.UIElements.Image>(id);frame.image=assets.Find("carta_moldura")?.texture;frame.scaleMode=ScaleMode.StretchToFill;}
            ui.Q("hq").RegisterCallback<PointerUpEvent>(e=>{var target=e.target as VisualElement;if(e.button==0&&dialogueOpen&&dialogueElapsed>.2f&&!(target is Button)&&target?.GetFirstAncestorOfType<Button>()==null)AdvanceDialogue();});
        }
        bool EnsureMenuInterface()
        {
            var current=GetComponent<UIDocument>().rootVisualElement;
            if(current==null||current.panel==null||current.childCount==0||progress==null)return false;
            if(ui==current)return true;
            if(dialogueOpen&&lines==null){Time.timeScale=1;UnityEngine.SceneManagement.SceneManager.LoadScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene().path);return false;}
            ui=current;BindUI();BindPortals();BindMenuVisuals();
            if(stage=="menu")Show("menu",true);
            else{Show("hud",true);Show("controls",true);Show("bossHud",stage=="boss");if(stage=="portals"){Show("portalsList",true);Label("stage","Portais do Farol");Label("objective","Explore o salão e o mezanino");Label("controls","A/D: andar · Espaço: pular · E: portal · Tab: lista · Esc: pausa");}}
            if(stage=="village"){villageShells=world.GetComponentsInChildren<FarolCampaignShell>(true);artifact=world.Find("Artefato");characters.Clear();foreach(var f in world.GetComponentsInChildren<FarolFlipbook>())characters[f.character]=f.transform;}
            Show("pause",paused);if(dialogueOpen){Show("hq",true);PresentLine();}
            bool restorePortals=portalsOpen||curiosityOpen||purchaseOpen;holdingPurchase=false;purchaseOpen=false;curiosityOpen=false;if(restorePortals)OpenPortals();
            return true;
        }
        void SetFramedBackdrop(string id,Texture texture){var image=ui.Q<UnityEngine.UIElements.Image>(id);image.image=texture;image.scaleMode=ScaleMode.ScaleAndCrop;image.tintColor=new Color(.23f,.24f,.26f,.55f);}
        void StartFromMenu(){if(progress.introSeen||progress.shells.Count>0||progress.artifact||progress.boarded||progress.bossPhase>0||progress.bossDone||progress.islandStarted){Show("confirm",true);ui.Q<Button>("cancelNew").Focus();}else StartNew();}
        bool Visible(string id)=>!ui.Q(id).ClassListContains("hidden");
        bool CloseMenuOverlay()
        {
            if(Visible("credits")){CloseCredits();return true;}
            if(Visible("settings")){CloseSound();return true;}
            if(Visible("confirm")){Show("confirm",false);ui.Q<Button>("play").Focus();return true;}
            return false;
        }
        void MenuShortcuts()
        {
            if(Visible("settings")||Visible("credits")||Visible("confirm"))return;
            if(Input.GetKeyDown(KeyCode.O))OpenSound(true);
            else if(Input.GetKeyDown(KeyCode.P))Load(portalsScene);
            else if(Input.GetKeyDown(KeyCode.L)){OpenListOnArrival=true;Load(portalsScene);}
            else if(Input.GetKeyDown(KeyCode.C))OpenCredits();
            else if(!(ui.focusController.focusedElement is Button)&&(Input.GetKeyDown(KeyCode.Return)||Input.GetKeyDown(KeyCode.Space)))StartFromMenu();
        }
        void OpenCredits()
        {
            var content=ui.Q("creditsContent");content.Clear();
            AddCredit(content,"Obrigado aos game designers",true);AddCredit(content,"Marcos Oliveira\nMatheus Oliveira",true);
            AddCredit(content,"Sons, efeitos e fonte",true);AddCredit(content,"Assets externos em domínio público (CC0), com agradecimento aos autores:",false);
            foreach(var entry in assets.Data["credits"]){AddCredit(content,(string)entry["autor"],true);AddCredit(content,string.Join(" · ",entry["obras"].Select(v=>(string)v))+" — "+(string)entry["lic"],false);}
            AddCredit(content,"Luckiest Guy © Astigmatic, sob a Apache License 2.0\nLicença em assets/fonts/LICENSE_LuckiestGuy_Apache2.txt",false);
            AddCredit(content,"Turma do Farol · obrigado por jogar!",true);
            Show("credits",true);ui.Q<ScrollView>("creditsScroll").scrollOffset=Vector2.zero;ui.Q<Button>("closeCredits").Focus();
        }
        static void AddCredit(VisualElement content,string text,bool author){var label=new Label(text);label.AddToClassList(author?"credits-author":"credits-work");content.Add(label);}
        void CloseCredits(){Show("credits",false);ui.Q<Button>("creditsButton").Focus();}
    }
}
