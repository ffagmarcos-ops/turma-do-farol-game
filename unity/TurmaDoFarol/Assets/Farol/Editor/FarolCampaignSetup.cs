using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UIElements;
namespace TurmaDoFarol.Editor
{
    public static class FarolCampaignBuilder
    {
        static FarolCampaignAssets assets;static string output;static string island;
        public static string Build()
        {
            if(EditorApplication.isPlaying)throw new InvalidOperationException("Saia do Play antes de preparar a campanha.");
            if(Enumerable.Range(0,SceneManager.sceneCount).Any(i=>SceneManager.GetSceneAt(i).isDirty))throw new InvalidOperationException("Salve a cena aberta antes de preparar a campanha.");
            island=EditorBuildSettings.scenes.Select(s=>s.path).FirstOrDefault(s=>s.EndsWith("Fase3_Ilha.unity"));
            output="Assets/Farol/Campanha_"+DateTime.Now.ToString("yyyyMMdd_HHmmss");Directory.CreateDirectory(output);AssetDatabase.Refresh();
            assets=ScriptableObject.CreateInstance<FarolCampaignAssets>();assets.data=AssetDatabase.LoadAssetAtPath<TextAsset>("Assets/Farol/Dados/campanha.json");
            AssetDatabase.CreateAsset(assets,output+"/Biblioteca.asset");
            var arts=new List<FarolCampaignAssets.Art>();
            try{
                var defs=assets.Data["textures"];
                foreach(var def in defs){string path=(string)def["path"];var importer=AssetImporter.GetAtPath(path) as TextureImporter;if(!importer)throw new InvalidOperationException("Imagem ausente: "+path);
                    if(importer.textureShape!=TextureImporterShape.Texture2D||importer.maxTextureSize<8192){importer.textureShape=TextureImporterShape.Texture2D;importer.maxTextureSize=8192;importer.textureCompression=TextureImporterCompression.Uncompressed;importer.SaveAndReimport();}
                    var texture=AssetDatabase.LoadAssetAtPath<Texture2D>(path);if(!texture)throw new InvalidOperationException("Textura 2D indisponivel: "+path);
                    string key=(string)def["key"];EditorUtility.DisplayProgressBar("Turma do Farol","Preparando "+key,(float)arts.Count/defs.Count());
                    int fw=(int)def["fw"],fh=(int)def["fh"];if(fw<0){fw=texture.width/(-fw);fh=texture.height;}if(fw==0){fw=texture.width;fh=texture.height;}
                    var frames=new List<Sprite>();var names=new List<string>();float scale=(float)def["scale"],pivot=(float)def["pivot"];
                    Action<string,Rect> add=(name,rect)=>{if(rect.xMin<0||rect.yMin<0||rect.xMax>texture.width||rect.yMax>texture.height)throw new InvalidOperationException("Recorte fora da imagem: "+key+"/"+name);var s=Sprite.Create(texture,rect,new Vector2(.5f,pivot),100/scale,0,SpriteMeshType.FullRect);s.name=key+"__"+name;AssetDatabase.AddObjectToAsset(s,assets);frames.Add(s);names.Add(name);};
                    if(def["rects"] is JArray rects){foreach(var r in rects)add((string)r["name"],new Rect((int)r["x"],texture.height-(int)r["y"]-(int)r["h"],(int)r["w"],(int)r["h"]));}
                    else {int index=0;for(int y=0;y+fh<=texture.height;y+=fh)for(int x=0;x+fw<=texture.width;x+=fw)add((index++).ToString(),new Rect(x,texture.height-y-fh,fw,fh));}
                    arts.Add(new FarolCampaignAssets.Art{key=key,texture=texture,frames=frames.ToArray(),names=names.ToArray()});
                }
                assets.art=arts.ToArray();assets.sounds=AssetDatabase.FindAssets("t:AudioClip",new[]{"Assets/Originais/audio"}).Select(AssetDatabase.GUIDToAssetPath).Select(p=>new FarolCampaignAssets.Sound{key=p.Substring("Assets/Originais/audio/".Length).Replace(Path.GetExtension(p),""),clip=AssetDatabase.LoadAssetAtPath<AudioClip>(p)}).ToArray();
                assets.interfaceTree=AssetDatabase.LoadAssetAtPath<VisualTreeAsset>("Assets/Farol/UI/Campanha.uxml");
                if(!assets.interfaceTree)throw new InvalidOperationException("Interface da campanha nao foi importada.");
                assets.panel=ScriptableObject.CreateInstance<PanelSettings>();assets.panel.scaleMode=PanelScaleMode.ScaleWithScreenSize;assets.panel.referenceResolution=new Vector2Int(1920,1080);assets.panel.match=.5f;
                AssetDatabase.CreateAsset(assets.panel,output+"/Painel.asset");EditorUtility.SetDirty(assets);AssetDatabase.SaveAssets();
                string menu=BuildMenu();string village=BuildVillage();string boss=BuildBoss();string portals=BuildPortals();string connectedIsland=BuildIsland();
                var scenes=new List<EditorBuildSettingsScene>{new EditorBuildSettingsScene(menu,true),new EditorBuildSettingsScene(village,true),new EditorBuildSettingsScene(boss,true),new EditorBuildSettingsScene(portals,true)};
                if(!string.IsNullOrEmpty(island))scenes.Add(new EditorBuildSettingsScene(connectedIsland,true));EditorBuildSettings.scenes=scenes.ToArray();
                AssetDatabase.SaveAssets();EditorSceneManager.OpenScene(menu);return output;
            }finally{EditorUtility.ClearProgressBar();}
        }
        static FarolCampaign Scene(string stage)
        {
            EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
            var camera=new GameObject("Main Camera");camera.tag="MainCamera";var lens=camera.AddComponent<Camera>();lens.orthographic=true;lens.orthographicSize=5.4f;lens.backgroundColor=new Color(.36f,.64f,.79f);camera.transform.position=new Vector3(9.6f,5.4f,-10);camera.AddComponent<AudioListener>();
            var root=new GameObject("Campanha");var c=root.AddComponent<FarolCampaign>();c.assets=assets;c.stage=stage;c.islandScene=string.IsNullOrEmpty(island)?"":Path.GetFileNameWithoutExtension(island);
            var doc=root.AddComponent<UIDocument>();doc.panelSettings=assets.panel;doc.visualTreeAsset=assets.interfaceTree;doc.sortingOrder=100;
            c.world=new GameObject(stage=="village"?"Vila das Conchas":stage=="boss"?"Esperanca e mar aberto":"Capa").transform;return c;
        }
        static Vector3 P(float x,float y)=>FarolCoordinates.Point(x,y);
        static SpriteRenderer Art(Transform root,string name,string key,float x,float y,int order,float width=0,float height=0,int frame=0)
        {
            var go=new GameObject(name);go.transform.SetParent(root,false);go.transform.position=P(x,y);var sr=go.AddComponent<SpriteRenderer>();sr.sprite=assets.Sprite(key,frame);sr.sortingOrder=order;
            if(!sr.sprite)throw new InvalidOperationException("Arte ausente: "+key);
            if(width>0){var b=sr.sprite.bounds.size;go.transform.localScale=new Vector3(width/100/b.x,(height>0?height/100/b.y:width/100/b.x),1);}return sr;
        }
        static void Bottom(SpriteRenderer sr,float x,float y){sr.transform.position=P(x,y)+Vector3.up*(sr.sprite.bounds.size.y/2-sr.sprite.bounds.min.y-sr.sprite.bounds.size.y/2)*sr.transform.localScale.y;}
        static void Solid(Transform root,string name,float x,float y,float w,float h)
        {var go=new GameObject(name);go.transform.SetParent(root,false);go.transform.position=FarolCoordinates.RectCenter(x,y,w,h);go.AddComponent<BoxCollider2D>().size=new Vector2(w/100,h/100);}
        static string Save(string name){string path=output+"/"+name+".unity";EditorSceneManager.SaveScene(SceneManager.GetActiveScene(),path);return path;}
        static string BuildMenu(){var c=Scene("menu");Art(c.world,"Quadro da pagina 09","menu_capa",960,540,-10,1920,1080);return Save("Menu_Campanha");}
        static string BuildPortals(){var c=Scene("portals");Art(c.world,"Interior do Farol","hub_bg_parede",960,540,-10,1920,1080);return Save("Portais_Farol");}
        static string BuildIsland()
        {
            if(string.IsNullOrEmpty(island))throw new InvalidOperationException("Fase 3 ausente.");
            EditorSceneManager.OpenScene(island);var c=UnityEngine.Object.FindFirstObjectByType<FarolCampaign>();
            if(!c)c=new GameObject("Campanha · chegada e portais").AddComponent<FarolCampaign>();
            c.stage="island";c.assets=assets;c.islandScene="Fase3_Ilha";
            var doc=c.GetComponent<UIDocument>();if(!doc)doc=c.gameObject.AddComponent<UIDocument>();doc.panelSettings=assets.panel;doc.visualTreeAsset=assets.interfaceTree;doc.sortingOrder=100;
            return Save("Fase3_Ilha");
        }
        static void Band(Transform root,string key,float factor,float top,float height,int order,float width=14336,float start=0)
        {
            var sprite=assets.Sprite(key);float scale=height/100/sprite.bounds.size.y;float span=1920+(width-1920)*factor;float sw=sprite.bounds.size.x*100*scale;
            for(float x=start;x<span+sw;x+=sw-1){var sr=Art(root,key,key,x+sw/2,top+height/2,order,sw,height);sr.gameObject.AddComponent<FarolCampaignParallax>().factor=factor;}
        }
        static FarolFlipbook Actor(Transform root,string who,float x,float y,int order)
        {
            var sr=Art(root,who,who,x,y,order);var f=sr.gameObject.AddComponent<FarolFlipbook>();f.assets=assets;f.character=who;f.texture=who;f.frames=new[]{0,1,2,3};f.fps=6;return f;
        }
        static string BuildVillage()
        {
            var c=Scene("village");var data=assets.Data["village"];
            Band(c.world,"bg_sky",.02f,0,1080,-50);Band(c.world,"bg_sea",.08f,760,340,-47);Band(c.world,"bg_village_far",.28f,0,1080,-38);Band(c.world,"bg_village_mid",.48f,360,640,-32);
            Band(c.world,"bg_harbor",.7f,390,620,-26,14336,1920+8600*.7f);
            foreach(var b in data["colliders"])Solid(c.world,(string)b["id"],(float)b["x"],(float)b["y"],(float)b["w"],(float)b["h"]);
            foreach(var b in data["obstacles"])Solid(c.world,(string)b["id"],(float)b["x"],(float)b["y"],(float)b["w"],(float)b["h"]);
            float tileW=assets.Sprite("pier_tile").rect.width*.6f,tileH=assets.Sprite("pier_tile").rect.height*.6f;
            for(float x=0;x<14336;x+=tileW)Art(c.world,"Pier","pier_tile",x+tileW/2,968+tileH/2,6,tileW,tileH);
            foreach(var prop in data["props"]){string key=(string)prop["key"];float x=(float)prop["x"],w=(float)prop["w"],h=(float)prop["h"];var sr=Art(c.world,(string)prop["id"]=="artifact"?"Artefato":(string)prop["id"],key,x,968-h/2,8,w,h);if(key=="artifact")sr.gameObject.SetActive(false);}
            foreach(var b in data["boats"])Art(c.world,"Esperanca","boat_esperanca",(float)b["x"],980-(float)b["h"]/2,11,(float)b["w"],(float)b["h"]);
            Art(c.world,"Rede baixa","nets",8890,739,10,220,98);
            foreach(var s in data["shells"]){bool gold=(bool?)s["gold"]??false;var sr=Art(c.world,(string)s["id"],"shell",(float)s["x"],(float)s["y"],18,gold?65:42,gold?65:42);if(gold)sr.color=new Color(1,.83f,.4f);var item=sr.gameObject.AddComponent<FarolCampaignShell>();item.id=(string)s["id"];item.gold=gold;}
            var hero=Actor(c.world,"marina",420,968,20);hero.gameObject.layer=8;hero.gameObject.AddComponent<Rigidbody2D>();var box=hero.gameObject.AddComponent<BoxCollider2D>();box.size=new Vector2(1.06f,2.34f);box.offset=Vector2.up*1.17f;c.player=hero.gameObject.AddComponent<FarolVillagePlayer>();c.player.campaign=c;
            foreach(var who in new[]{"julia","lucas","bia","toninho"})Actor(c.world,who,(float)data["actors"][who]["x"],968,19);
            c.dog=Actor(c.world,"faisca",640,968,19).transform;
            var cam=Camera.main.gameObject.AddComponent<FarolCamera>();cam.target=hero.transform;cam.levelWidth=143.36f;
            return Save("Fase1_Vila");
        }
        static string BuildBoss()
        {
            var c=Scene("boss");var b=c.gameObject.AddComponent<FarolOctopusBattle>();b.assets=assets;c.battle=b;
            b.sky=Art(c.world,"Ceu de tempestade","f2_sky",960,540,-50,1920,1080);
            Art(c.world,"Nuvens","f2_clouds",960,340,-45,1920,700);Art(c.world,"Mar distante","f2_sea_far",960,800,-40,1920,560);Art(c.world,"Mar medio","f2_sea_mid",960,920,10,1920,320);
            b.boat=Art(c.world,"Barco Esperanca","f2_barco",960,700,20,1500).transform;
            float boatHeight=assets.Sprite("f2_barco").rect.height*1500/assets.Sprite("f2_barco").rect.width;
            b.boat.position=P(960,700+(.5f-.645f)*boatHeight);
            // Pivo do barco no conves, mantendo a arte na posicao correta.
            var rig=new GameObject("Barco e tripulacao").transform;rig.SetParent(c.world,false);rig.position=P(960,700);b.boat.SetParent(rig,true);b.boat=rig;
            var octo=new GameObject("Polvo em partes").transform;octo.SetParent(c.world,false);octo.position=P(960,420);b.octopus=octo;
            b.body=Art(octo,"Manto","f2_polvo_partes",960,420,4);b.body.sprite=assets.Part("f2_polvo_partes","mantle");b.body.transform.localScale=Vector3.one*1.08f;
            b.eyes=Art(octo,"Olhos","f2_polvo_olhos",960,472,5,752,470);
            b.mouth=Art(octo,"Boca","f2_polvo_partes",960,708,5);b.mouth.sprite=assets.Part("f2_polvo_partes","mouthNeutral");b.mouth.transform.localScale=Vector3.one*.67f;
            b.tentacleImages=new[]{Art(c.world,"Tentaculo esquerdo","f2_tent_est",460,1000,32),Art(c.world,"Tentaculo direito","f2_tent_est",1460,1000,32)};foreach(var t in b.tentacleImages)t.enabled=false;
            var hero=Art(c.world,"Lucas · aparelho sonico","f2_lucas_sonic",960,700,30);b.lucas=hero.transform;var anim=hero.gameObject.AddComponent<FarolFlipbook>();anim.assets=assets;anim.texture="f2_lucas_sonic";anim.frames=new[]{0,1,2,3};anim.character="lucas_sonico";
            string[] crew={"marina","bia","julia","faisca","toninho"};float[] xs={300,455,1415,1600,495};
            for(int i=0;i<crew.Length;i++){
                string who=crew[i];string key="f2s_"+who;float py=who=="toninho"?700-(.645f-.52f)*boatHeight:700;
                var sr=Art(rig,who,key,xs[i],py,who=="toninho"?21:24);sr.transform.localScale=Vector3.one*(who=="faisca"?.6f:1);
                var f=sr.gameObject.AddComponent<FarolFlipbook>();f.assets=assets;f.character=key;f.texture=key;f.frames=new[]{0,1,2,3,4,5};f.fps=8;
            }
            Art(c.world,"Ondas em primeiro plano","f2_waves_front",960,1060,38,1920,240);
            var rain=Art(c.world,"Chuva","f2_cc0_chuva",960,540,39,1920,1080);rain.color=new Color(1,1,1,.18f);
            return Save("Fase2_Polvo");
        }
    }
}
