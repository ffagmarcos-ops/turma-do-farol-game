using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using UnityEngine;
using UnityEngine.UIElements;
namespace TurmaDoFarol
{
    public sealed partial class FarolCampaign
    {
        string pendingPortal; bool holdingPurchase; float holdStart; int holdPointer=-1;
        JToken curiosity; int cardIndex,lensStep,knotRow;string activeExtra;bool artExpanded;float knotUntil; bool portalsOpen,curiosityOpen,purchaseOpen;
        void NormalizeProgress(){progress.doors??=new List<string>();progress.seen??=new List<string>();progress.islandShells??=new List<string>();if(progress.boarded&&!progress.doors.Contains("mar"))progress.doors.Add("mar");if(progress.bossDone&&!progress.doors.Contains("ilha"))progress.doors.Add("ilha");}
        void BindPortals()
        {
            Click("closePortals",()=>{if(stage=="portals")Load(menuScene);else ShowPortals(false);});
            Click("cancelPurchase",CancelPurchase);Click("closeCuriosity",()=>{curiosityOpen=false;Show("curiosity",false);});
            Click("nextCard",()=>{cardIndex++;PresentCard();});Click("previousCard",()=>{cardIndex=Mathf.Max(0,cardIndex-1);PresentCard();});
            ui.Q<UnityEngine.UIElements.Image>("curiosityArt").RegisterCallback<PointerDownEvent>(e=>InteractExtra());
            var button=ui.Q<Button>("openPurchase");
            button.RegisterCallback<PointerDownEvent>(e=>{if(e.button!=0||!purchaseOpen)return;holdingPurchase=true;holdStart=Time.unscaledTime;holdPointer=e.pointerId;button.CapturePointer(e.pointerId);e.StopPropagation();},TrickleDown.TrickleDown);
            button.RegisterCallback<PointerUpEvent>(e=>StopPurchaseHold(),TrickleDown.TrickleDown);
            button.RegisterCallback<PointerCancelEvent>(e=>StopPurchaseHold(),TrickleDown.TrickleDown);
            button.RegisterCallback<PointerCaptureOutEvent>(e=>StopPurchaseHold(),TrickleDown.TrickleDown);
        }
        public void OpenPortals(){ShowPortals(true);RenderPortals();}
        void ShowPortals(bool visible){portalsOpen=visible;Show("portals",visible);}
        bool MeetsRequirement(JToken p)=>p==null?false:(string)p["requer"]=="f1"?(progress.boarded||progress.doors.Contains("mar")):(string)p["requer"]=="f2"?(progress.bossDone||progress.doors.Contains("ilha")):true;
        JToken Portal(string id)=>assets.Data["portals"].FirstOrDefault(p=>(string)p["id"]==id);
        public bool PortalOpen(string id){var p=Portal(id);return MeetsRequirement(p)&&((int)p["preco"]==0||progress.doors.Contains(id));}
        public bool PurchasePortal(string id)
        {
            var p=Portal(id);if(!MeetsRequirement(p))return false;if(PortalOpen(id))return true;
            int cost=(int)p["preco"];if(progress.wallet<cost)return false;
            progress.wallet-=cost;progress.doors.Add(id);Store();return true;
        }
        void RenderPortals()
        {
            Label("portalWallet",$"Carteira: {progress.wallet} conchas · Selecione uma porta para visitar ou abrir");
            var grid=ui.Q("portalGrid");grid.Clear();
            foreach(var p in assets.Data["portals"])
            {
                string id=(string)p["id"];var card=new VisualElement();card.AddToClassList("portal-card");
                string art=id=="ilha"?"portal_fase3_correntes":id=="vila-ilha"?"cena_vila_bg":id=="mar"?"cena_mar_bg":id=="vila"?"cena_vila_bg":"cena_"+id;
                var image=new UnityEngine.UIElements.Image{image=assets.Find(art)?.texture,scaleMode=ScaleMode.ScaleToFit};image.AddToClassList("portal-thumbnail");card.Add(image);
                card.Add(new Label((string)p["nome"]));
                string status=!MeetsRequirement(p)?((string)p["requer"]=="f2"?"Conclua a batalha do polvo":"Embarque no Esperança"):PortalOpen(id)?"Entrar":$"Abrir · {p["preco"]} conchas";
                var button=new Button(()=>SelectPortal(id)){text=status};button.SetEnabled(MeetsRequirement(p));card.Add(button);grid.Add(card);
            }
        }
        public void SelectPortal(string id)
        {
            var p=Portal(id);if(!MeetsRequirement(p))return;
            if(PortalOpen(id)){EnterPortal(id);return;}
            if(progress.wallet<(int)p["preco"]){Label("portalNotice","Ainda faltam conchas para abrir esta porta.");return;}
            pendingPortal=id;purchaseOpen=true;Show("portalPurchase",true);
            Label("purchaseTitle",(string)p["nome"]);Label("purchaseText",$"Esta porta custa {p["preco"]} conchas. Saldo após abrir: {progress.wallet-(int)p["preco"]}. A abertura fica salva.");
            ui.Q<Button>("cancelPurchase").Focus();ui.Q<ProgressBar>("purchaseHold").value=0;
        }
        void EnterPortal(string id)
        {
            if(id=="vila"){Load(villageScene);return;}if(id=="mar"){Load(bossScene);return;}if(id=="ilha"){if(!progress.islandStarted)GoIsland();else Load(islandScene);return;}
            curiosity=assets.Data["curiosities"].FirstOrDefault(c=>(string)c["portal"]==id);
            if(curiosity==null){Label("portalNotice","Conteúdo indisponível.");return;}cardIndex=0;curiosityOpen=true;Show("curiosity",true);PresentCard();
        }
        void PresentCard()
        {
            var cards=(JArray)curiosity["cartas"];if(cardIndex>=cards.Count){curiosityOpen=false;Show("curiosity",false);return;}
            var card=cards[cardIndex];string mark=$"cur-{curiosity["id"]}-{cardIndex+1}";if(!progress.seen.Contains(mark)){progress.seen.Add(mark);Store();}
            Label("curiosityTitle",$"{card["titulo"]} · {cardIndex+1}/{cards.Count}");Label("curiosityText",(string)card["texto"]??"");
            string art=(string)card["img"]??(string)curiosity["cena"];SetCuriosityArt(art);var extras=ui.Q("extraImages");extras.Clear();
            if(card["fotos"] is JArray photos)foreach(var photo in photos){string key=(string)photo;extras.Add(new Button(()=>SetCuriosityArt(key)){text="Foto "+(extras.childCount+1)});}
            string extra=(string)card["extra"];activeExtra=extra;artExpanded=false;lensStep=0;var picture=ui.Q("curiosityArt");picture.RemoveFromClassList("art-expanded");for(int i=0;i<8;i++)picture.RemoveFromClassList("lens-"+i);
            if(extra=="explodido")SetCuriosityArt("lucas_aparelho_explodido");
            if(extra=="mapa") {SetCuriosityArt("vila_mapa_ilustrado");Label("curiosityText",(string)card["texto"]+$"\nConchas encontradas na vila: {progress.shells.Count}/120.");}
            if(extra=="nos"){knotRow=0;knotUntil=Time.unscaledTime+2;string[] names={"Lais de guia","Escota","Oito"};for(int i=0;i<3;i++){int row=i;extras.Add(new Button(()=>{knotRow=row;knotUntil=Time.unscaledTime+2;}){text=names[i]});}}
            ui.Q<Button>("previousCard").SetEnabled(cardIndex>0);ui.Q<Button>("nextCard").text=cardIndex==cards.Count-1?"Voltar aos portais":"Próxima →";
        }
        void SetCuriosityArt(string key){var image=ui.Q<UnityEngine.UIElements.Image>("curiosityArt");image.image=assets.Find(key)?.texture;image.scaleMode=ScaleMode.ScaleToFit;}
        void StopPurchaseHold(){holdingPurchase=false;ui.Q<ProgressBar>("purchaseHold").value=0;var b=ui.Q<Button>("openPurchase");if(holdPointer>=0&&b.HasPointerCapture(holdPointer))b.ReleasePointer(holdPointer);holdPointer=-1;}
        void CancelPurchase(){StopPurchaseHold();purchaseOpen=false;pendingPortal=null;Show("portalPurchase",false);}
        void InteractExtra(){if(activeExtra=="lente"){var image=ui.Q("curiosityArt");image.RemoveFromClassList("lens-"+lensStep);lensStep=(lensStep+1)%8;image.AddToClassList("lens-"+lensStep);}else if(activeExtra=="zoom"||activeExtra=="explodido"){artExpanded=!artExpanded;ui.Q("curiosityArt").EnableInClassList("art-expanded",artExpanded);}}
        void UpdatePortalHold(){if(curiosityOpen&&activeExtra=="nos"){var image=ui.Q<UnityEngine.UIElements.Image>("curiosityArt");image.image=null;image.sprite=assets.Sprite("toninho_nos_sheet",knotRow*4+(Time.unscaledTime<knotUntil?(int)(Time.unscaledTime*7)%4:3));}if(!holdingPurchase)return;float elapsed=Time.unscaledTime-holdStart;ui.Q<ProgressBar>("purchaseHold").value=Mathf.Clamp01(elapsed/.6f)*100;if(elapsed<.6f)return;string id=pendingPortal;CancelPurchase();if(PurchasePortal(id)){Sfx("sfx_bell");RenderPortals();EnterPortal(id);}}
        bool ClosePortalOverlay(){if(purchaseOpen){CancelPurchase();return true;}if(curiosityOpen){curiosityOpen=false;Show("curiosity",false);return true;}if(portalsOpen){if(stage=="portals")Load(menuScene);else ShowPortals(false);return true;}return false;}
        void OnApplicationFocus(bool focus){if(!focus&&ui!=null)StopPurchaseHold();}
        void StartIsland()
        {
            var session=FindFirstObjectByType<FarolGameSession>();
            if(progress.arriveIsland&&session&&session.player){session.player.Teleport(new Vector2(1.5f,1.84f));session.Checkpoint(new Vector2(1.5f,1.84f));progress.arriveIsland=false;Store();}
            progress.islandStarted=true;progress.resumeStage="island";Store();UpdateIsland();
        }
        void UpdateIsland(){Label("stage","Fase 3 · Ilha das Cavernas Azuis");Label("objective","Explore a praia e avance pela ilha");Label("shells",$"Carteira: {progress.wallet} conchas");Label("controls","A/D: andar · Shift: correr · Espaço: pular · S: agachar · Z: concha · X: carregar latido · Esc: pausa e portais");}
        public void CollectIsland(string id,int value){if(progress.islandShells.Contains(id))return;progress.islandShells.Add(id);progress.wallet+=value;Store();}
    }
}
