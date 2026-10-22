using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
namespace TurmaDoFarol.Editor
{
    public static class FarolIslandVisualRepair
    {
        public static string Apply()
        {
            if(EditorApplication.isPlaying)throw new InvalidOperationException("Saia do Play antes de ajustar as artes.");
            var scene=UnityEngine.SceneManagement.SceneManager.GetActiveScene();
            var campaign=UnityEngine.Object.FindFirstObjectByType<FarolCampaign>();
            if(!campaign||campaign.stage!="island")throw new InvalidOperationException("Abra a cena da ilha antes de ajustar as artes.");
            if(scene.isDirty)throw new InvalidOperationException("Salve a cena antes de ajustar as artes.");
            const string folder="Assets/Farol/DecorProcedural",libraryPath=folder+"/Decor.asset";
            var spec=JObject.Parse(File.ReadAllText(folder+"/decor.json"));
            var entries=((JArray)spec["entries"]).ToDictionary(e=>(string)e["sector"]+"/"+(string)e["key"]);
            var library=AssetDatabase.LoadAssetAtPath<FarolCampaignAssets>(libraryPath);
            if(!library){library=ScriptableObject.CreateInstance<FarolCampaignAssets>();AssetDatabase.CreateAsset(library,libraryPath);}
            var arts=(library.art??Array.Empty<FarolCampaignAssets.Art>()).ToList();
            var layers=(JArray)spec["layers"];
            foreach(string path in entries.Values.Concat(layers).Select(e=>(string)e["path"]).Distinct())
            {
                if(arts.Any(a=>a.key==path))continue;
                var importer=AssetImporter.GetAtPath(path) as TextureImporter;
                if(!importer)throw new InvalidOperationException("Desenho não importado: "+path);
                importer.textureShape=TextureImporterShape.Texture2D;importer.textureType=TextureImporterType.Default;importer.mipmapEnabled=false;importer.alphaIsTransparency=true;importer.textureCompression=TextureImporterCompression.Uncompressed;importer.wrapMode=TextureWrapMode.Clamp;importer.SaveAndReimport();
                var texture=AssetDatabase.LoadAssetAtPath<Texture2D>(path);
                var sprite=Sprite.Create(texture,new Rect(0,0,texture.width,texture.height),new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect);sprite.name=Path.GetFileNameWithoutExtension(path);AssetDatabase.AddObjectToAsset(sprite,library);
                arts.Add(new FarolCampaignAssets.Art{key=path,texture=texture,frames=new[]{sprite},names=new[]{"0"}});
            }
            library.art=arts.ToArray();EditorUtility.SetDirty(library);AssetDatabase.SaveAssets();
            int count=0;
            foreach(var marker in UnityEngine.Object.FindObjectsByType<FarolSourceMarker>(FindObjectsSortMode.None).Where(m=>m.category=="decor"))
            {
                var item=JObject.Parse(marker.originalJson);string key=marker.sector+"/"+(string)item["kind"];
                if(!entries.TryGetValue(key,out var def))continue;
                var sr=marker.GetComponent<SpriteRenderer>();if(!sr)throw new InvalidOperationException("Decoração sem SpriteRenderer: "+marker.name);
                var sprite=library.Sprite((string)def["path"]);if(!sprite)throw new InvalidOperationException("Sprite ausente: "+key);
                float scale=(float?)item["scale"]??1;if(scale==0)scale=1;
                sr.sprite=sprite;sr.drawMode=SpriteDrawMode.Simple;sr.color=Color.white;sr.transform.localScale=new Vector3((float)def["w"]*scale/100/sprite.bounds.size.x,(float)def["h"]*scale/100/sprite.bounds.size.y,1);
                marker.requiresPort=false;marker.nextStep="Desenho procedural original de Fase3Placeholders.js, exportado sem alterar as artes originais.";count++;
            }
            int restoredLayers=0;var player=UnityEngine.Object.FindFirstObjectByType<FarolPlayerController>();
            foreach(var def in layers)
            {
                string sector=(string)def["sector"];int n=(int)def["n"];
                var root=UnityEngine.Object.FindObjectsByType<FarolSourceMarker>(FindObjectsSortMode.None).First(m=>m.category=="sector"&&m.sector==sector).transform;
                if(root.Find("Fundo camada "+n))continue;
                var node=new GameObject("Fundo camada "+n);node.transform.SetParent(root,false);
                var parallax=node.AddComponent<FarolParallaxLayer>();parallax.player=player.transform;parallax.cameraTransform=Camera.main.transform;parallax.factor=(float)def["factor"];parallax.x0=(float)def["x0"]/100;parallax.x1=(float)def["x1"]/100;
                var sprite=library.Sprite((string)def["path"]);parallax.width=sprite.bounds.size.x;parallax.verticalCenter=(1080-(float)def["placeholder"]["y"]-(float)def["placeholder"]["h"]/2)/100;
                int panels=Mathf.CeilToInt(19.2f/parallax.width)+3;parallax.panels=new SpriteRenderer[panels];
                for(int i=0;i<panels;i++){var panel=new GameObject("Painel "+i);panel.transform.SetParent(node.transform,false);var sr=panel.AddComponent<SpriteRenderer>();sr.sprite=sprite;sr.sortingOrder=n<4?-50+n*5:25+n;sr.color=new Color(1,1,1,(float?)def["alpha"]??1);sr.enabled=sector=="A";panel.transform.position=new Vector3(parallax.x0+(i-panels/2)*parallax.width,parallax.verticalCenter,0);parallax.panels[i]=sr;}
                restoredLayers++;
            }
            EditorSceneManager.MarkSceneDirty(scene);EditorSceneManager.SaveScene(scene);return count+" decorações restauradas com "+arts.Count+" desenhos originais e "+restoredLayers+" camadas recuperadas.";
        }
    }
}
