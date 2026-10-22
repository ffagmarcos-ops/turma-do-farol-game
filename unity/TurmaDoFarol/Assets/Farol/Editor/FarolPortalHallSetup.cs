using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
namespace TurmaDoFarol.Editor
{
    public static class FarolPortalHallSetup
    {
        public static string Repair()
        {
            if(EditorApplication.isPlaying)throw new InvalidOperationException("Saia do Play antes de preparar o salão.");
            if(UnityEngine.SceneManagement.SceneManager.GetActiveScene().isDirty)throw new InvalidOperationException("Salve a cena aberta antes de preparar o salão.");
            string path=EditorBuildSettings.scenes.Select(s=>s.path).First(p=>p.EndsWith("Portais_Farol.unity"));
            EditorSceneManager.OpenScene(path);var c=UnityEngine.Object.FindFirstObjectByType<FarolCampaign>();if(c.GetComponent<FarolPortalHall>()){if(c.world.name!="Salão dos Portais · cenário original")throw new InvalidOperationException("Salão diferente do gerado; revise antes de preparar.");UnityEngine.Object.DestroyImmediate(c.GetComponent<FarolPortalHall>());foreach(Transform child in c.world.Cast<Transform>().ToArray())UnityEngine.Object.DestroyImmediate(child.gameObject);}Populate(c);EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene());return path;
        }
        public static void Populate(FarolCampaign c)
        {
            if(c.GetComponent<FarolPortalHall>())throw new InvalidOperationException("Este salão já foi preparado.");
            ImportImages(c.assets);
            var old=c.world.Find("Interior do Farol");if(old)UnityEngine.Object.DestroyImmediate(old.gameObject);
            c.world.name="Salão dos Portais · cenário original";var hall=c.gameObject.AddComponent<FarolPortalHall>();
            var sky=Art(c,"Céu e mar","hub_bg_ceu_mar",1920,540,3840,1080,-50);sky.color=new Color(.56f,.58f,.65f);sky.gameObject.AddComponent<FarolCampaignParallax>().factor=.35f;
            hall.lens=Art(c,"Lente do Farol","hub_lente_farol",1910,520,520,520,-45).transform;
            Art(c,"Paredes e janelas","hub_bg_parede",1920,540,3840,1080,-40);
            foreach(int dir in new[]{-1,1}){var ray=Art(c,"Feixe de luz "+dir,"hub_raios_luz",1910+dir*800,520,1600,800,-35);ray.flipX=dir<0;ray.color=new Color(1,1,1,.4f);}
            Art(c,"Chão e mezanino","hub_chao_mezanino",1920,540,3840,1080,-30);
            var front=Art(c,"Cordas em primeiro plano","hub_frente_cordas",1920,880,3840,400,40);front.color=new Color(1,1,1,.65f);front.gameObject.AddComponent<FarolCampaignParallax>().factor=1.25f;
            Solid(c,"Chão",0,800,3840,300,false);Solid(c,"Mezanino",740,270,2345,24,true);
            foreach(int side in new[]{-1,1})foreach(float y in new[]{710f,620,530,440,350}){float x=side<0?150+(712-y)/431*600:3712-(712-y)/431*640;Solid(c,"Degrau "+side+" "+y,x-45,y,90,20,true);}
            Solid(c,"Parede esquerda",-40,0,40,1080,false);Solid(c,"Parede direita",3840,0,40,1080,false);
            string[] floor={"vila","mar","marina","faisca","bia","julia","lucas","toninho"},upper={"vila-ilha","esperanca","farol","polvo","cavernas","bastidores","ilha"};
            var doors=new List<FarolPortalHall.Door>();for(int i=0;i<floor.Length;i++)doors.Add(Door(c,floor[i],830+i*305,800,220,293));for(int i=0;i<upper.Length;i++)doors.Add(Door(c,upper[i],900+i*345,270,165,220));hall.doors=doors.ToArray();
            var hero=Art(c,"Marina","marina",830,796,0,0,20);var flip=hero.gameObject.AddComponent<FarolFlipbook>();flip.assets=c.assets;flip.character="marina";flip.texture="marina";flip.frames=new[]{0,1,2,3};flip.fps=6;
            hero.gameObject.layer=8;hero.gameObject.AddComponent<Rigidbody2D>();hero.gameObject.AddComponent<BoxCollider2D>();c.player=hero.gameObject.AddComponent<FarolVillagePlayer>();c.player.campaign=c;c.player.levelWidth=38.4f;c.checkpoint=new Vector2(8.3f,2.84f);
            var camera=Camera.main;var follow=camera.GetComponent<FarolCamera>();if(!follow)follow=camera.gameObject.AddComponent<FarolCamera>();follow.target=hero.transform;follow.levelWidth=38.4f;camera.transform.position=new Vector3(9.6f,5.4f,-10);
            EditorSceneManager.MarkSceneDirty(UnityEngine.SceneManagement.SceneManager.GetActiveScene());
        }
        static void ImportImages(FarolCampaignAssets assets)
        {
            var art=assets.art.ToList();
            foreach(string dir in new[]{"Assets/Originais/farol/fase3/hub","Assets/Originais/farol/fase3/portais","Assets/Originais/farol/fase3/ui"})foreach(string path in Directory.GetFiles(dir,"*.png"))
            {
                string key=Path.GetFileNameWithoutExtension(path);int frames=key=="cadeado_concha_sheet"?3:key=="portal_vitral_rachaduras_sheet"?4:1;
                var existing=art.FirstOrDefault(a=>a.key==key);if(existing!=null&&existing.frames.Length==frames)continue;
                var importer=(TextureImporter)AssetImporter.GetAtPath(path);importer.textureShape=TextureImporterShape.Texture2D;importer.maxTextureSize=8192;importer.textureCompression=TextureImporterCompression.Uncompressed;importer.mipmapEnabled=false;importer.alphaIsTransparency=true;importer.SaveAndReimport();
                var texture=AssetDatabase.LoadAssetAtPath<Texture2D>(path);var sprites=new List<Sprite>();for(int i=0;i<frames;i++){var sprite=Sprite.Create(texture,new Rect(i*texture.width/frames,0,texture.width/frames,texture.height),new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect);sprite.name=key+"__hall_"+i;AssetDatabase.AddObjectToAsset(sprite,assets);sprites.Add(sprite);}
                if(existing!=null)art.Remove(existing);art.Add(new FarolCampaignAssets.Art{key=key,texture=texture,frames=sprites.ToArray(),names=Enumerable.Range(0,frames).Select(i=>i.ToString()).ToArray()});
            }
            assets.art=art.ToArray();assets.InvalidateCache();EditorUtility.SetDirty(assets);AssetDatabase.SaveAssets();
        }
        static SpriteRenderer Art(FarolCampaign c,string name,string key,float x,float y,float w,float h,int order)
        {
            var sprite=c.assets.Sprite(key);if(!sprite)throw new InvalidOperationException("Imagem ausente: "+key);var go=new GameObject(name);go.transform.SetParent(c.world,false);go.transform.position=FarolCoordinates.Point(x,y);var sr=go.AddComponent<SpriteRenderer>();sr.sprite=sprite;sr.sortingOrder=order;if(w>0)go.transform.localScale=new Vector3(w/100/sprite.bounds.size.x,h/100/sprite.bounds.size.y,1);return sr;
        }
        static void Solid(FarolCampaign c,string name,float x,float y,float w,float h,bool oneWay){var go=new GameObject(name);go.transform.SetParent(c.world,false);go.transform.position=FarolCoordinates.RectCenter(x,y,w,h);var box=go.AddComponent<BoxCollider2D>();box.size=new Vector2(w/100,h/100);if(oneWay){box.usedByEffector=true;var e=go.AddComponent<PlatformEffector2D>();e.useOneWay=true;e.surfaceArc=170;}}
        static FarolPortalHall.Door Door(FarolCampaign c,string id,float x,float y,float w,float h)
        {
            string key=id=="vila"||id=="vila-ilha"?"cena_vila_bg":id=="mar"?"cena_mar_bg":id=="ilha"?"cena_cavernas":"cena_"+id;float ow=w*422/768,oh=h*735/1024,cy=y-oh/2;
            Art(c,"Imagem · "+id,key,x,cy,ow,oh,5);
            string fg=id=="vila"?"cena_vila_fg":id=="mar"?"cena_mar_fg":id=="faisca"?"cena_faisca_rabo":null;if(fg!=null)Art(c,"Detalhe · "+id,fg,x,cy,ow,oh,6);
            var glass=Art(c,"Vitral · "+id,"portal_vitral_fechado",x,cy,ow,oh,7);glass.color=new Color(.7f,.7f,.7f,.8f);
            var ring=Art(c,"Energia · "+id,"portal_anel_energia",x,cy,w*1.15f,w*1.15f,8);ring.color=new Color(.25f,.84f,.78f,.3f);
            Art(c,"Moldura · "+id,"portal_moldura",x,y-h/2,w,h,10);var padlock=Art(c,"Cadeado · "+id,"cadeado_concha_sheet",x,y-30,w*.27f,w*.27f,12);
            bool upper=y<800;float py=upper?340:y-h-38,pw=upper?250:290;
            Art(c,"Placa · "+id,"placa_preco_dourada",x,py,pw,pw*160/512,13);
            Art(c,"Concha · "+id,"icone_concha_hud",x-pw*.345f,py,pw*.12f,pw*.12f,14);
            string title=(string)c.assets.Data["portals"].First(p=>(string)p["id"]==id)["nome"];
            if(id=="cavernas")title="Cavernas Azuis\ne o Artefato";else if(id=="ilha")title="Ilha das Cavernas Azuis";
            int limit=upper?16:18;if(title.Length>limit&&!title.Contains("\n")){int split=title.LastIndexOf(' ',limit);if(split>0)title=title.Substring(0,split)+"\n"+title.Substring(split+1);}
            Text(c,title,x+pw*.08f,py-15,upper?.04f:.045f);var price=Text(c,"",x+pw*.08f,py+20,upper?.048f:.055f);
            var point=new GameObject("Entrada · "+id).transform;point.SetParent(c.world,false);point.position=FarolCoordinates.Point(x,y);return new FarolPortalHall.Door{id=id,point=point,glass=glass,padlock=padlock,ring=ring,price=price};
        }
        static TextMesh Text(FarolCampaign c,string text,float x,float y,float size){var go=new GameObject("Nome · "+text);go.transform.SetParent(c.world,false);go.transform.position=FarolCoordinates.Point(x,y);var label=go.AddComponent<TextMesh>();label.text=text;label.characterSize=size;label.fontSize=48;label.anchor=TextAnchor.MiddleCenter;label.color=new Color(.16f,.09f,.04f);label.font=Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");var renderer=go.GetComponent<MeshRenderer>();renderer.sharedMaterial=label.font.material;renderer.sortingOrder=15;return label;}
    }
}
