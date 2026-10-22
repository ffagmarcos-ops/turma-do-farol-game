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
    public static class FarolIslandGameplayRepair
    {
        public static string Apply()
        {
            if(EditorApplication.isPlaying)throw new InvalidOperationException("Saia do Play antes de ajustar a ilha.");
            var campaign=UnityEngine.Object.FindFirstObjectByType<FarolCampaign>();if(!campaign||campaign.stage!="island")throw new InvalidOperationException("Abra Fase3_Ilha.");
            var scene=campaign.gameObject.scene;if(scene.isDirty)throw new InvalidOperationException("Salve a cena antes de preparar as mecânicas.");
            var catalog=JsonUtility.FromJson<FarolCatalog>(File.ReadAllText("Assets/Farol/Dados/catalogo.json"));var lookup=new Dictionary<string,Sprite>();
            foreach(var group in catalog.sprites.GroupBy(s=>s.path)){var sprites=AssetDatabase.LoadAllAssetsAtPath(group.Key).OfType<Sprite>().ToArray();foreach(var def in group){var sprite=def.multiple?sprites.FirstOrDefault(s=>s.name==def.name):sprites.FirstOrDefault();if(!sprite)throw new InvalidOperationException("Sprite ausente: "+def.id);lookup[def.id]=sprite;}}
            foreach(var alias in catalog.images)if(lookup.TryGetValue(alias.sprite,out var sprite))lookup[alias.key]=sprite;
            foreach(var entry in new[]{new[]{"f3_caixa_marina","crate"},new[]{"f3_orbe_energia","island_orb"}}){string path="Assets/Farol/DecorProcedural/"+entry[0]+".png";AssetDatabase.ImportAsset(path);var importer=(TextureImporter)AssetImporter.GetAtPath(path);importer.textureShape=TextureImporterShape.Texture2D;importer.textureType=TextureImporterType.Sprite;importer.spriteImportMode=SpriteImportMode.Single;importer.spritePixelsPerUnit=100;importer.mipmapEnabled=false;importer.alphaIsTransparency=true;importer.SaveAndReimport();lookup[entry[1]]=AssetDatabase.LoadAssetAtPath<Sprite>(path);}
            var player=UnityEngine.Object.FindFirstObjectByType<FarolPlayerController>();var art=campaign.GetComponent<FarolIslandArt>();if(!art)art=campaign.gameObject.AddComponent<FarolIslandArt>();art.keys=lookup.Keys.ToArray();art.sprites=art.keys.Select(k=>lookup[k]).ToArray();art.controller=player.GetComponent<Animator>().runtimeAnimatorController;
            var runtime=campaign.GetComponent<FarolIslandMechanics>();if(!runtime)runtime=campaign.gameObject.AddComponent<FarolIslandMechanics>();runtime.map=AssetDatabase.LoadAssetAtPath<TextAsset>("Assets/Farol/Dados/fase3.json");
            var markers=UnityEngine.Object.FindObjectsByType<FarolSourceMarker>(FindObjectsSortMode.None);int surfaces=0;
            foreach(var marker in markers){var item=JObject.Parse(marker.originalJson);
                if((marker.category=="ground"||marker.category=="platforms")&&((bool?)item["crumble"]==true||(bool?)item["slippery"]==true)){
                    var surface=marker.GetComponent<FarolIslandSurface>();if(!surface)surface=marker.gameObject.AddComponent<FarolIslandSurface>();surface.id=marker.sourceId;surface.crumble=(bool?)item["crumble"]??false;surface.slippery=(bool?)item["slippery"]??false;
                    if((bool?)item["crumble"]==true){var animator=marker.GetComponent<Animator>();if(!animator)animator=marker.gameObject.AddComponent<Animator>();animator.runtimeAnimatorController=art.controller;surface.animator=animator;var pose=marker.GetComponent<FarolPose>();if(!pose)pose=marker.gameObject.AddComponent<FarolPose>();pose.animationName="crumble.idle";}surfaces++;
                }
                var wall=marker.GetComponent<FarolBreakable>();if(wall)wall.id=marker.sourceId;
                if(marker.category=="helper"&&(string)item["event"]!="helpZoneToninho"){var pose=marker.GetComponent<FarolPose>();if(pose)pose.enabled=false;}
                if(marker.requiresPort&&new[]{"platforms","ground","enemies","secrets","helper","buoy","waterfalls","triggers","energyOrbs","relics","hints"}.Contains(marker.category)){marker.requiresPort=false;marker.nextStep="Mecânica nativa ligada por FarolIslandMechanics, FarolEnemy ou FarolIslandSurface; conferir relatório da revisão.";}
            }
            // Água usa o retângulo de colisão existente; sua superfície ganha a animação oficial.
            foreach(var marker in markers.Where(m=>m.category=="water"||m.category=="waveHits")){
                var item=JObject.Parse(marker.originalJson);string childName="Espuma animada";if(marker.transform.Find(childName))continue;
                float width=marker.category=="water"?(float)item["w"]/100:2.8f;var origin=marker.category=="water"?FarolCoordinates.Point((float)item["x"]+(float)item["w"]/2,(float)item["y"]-10):FarolCoordinates.Point((float)item["x"],(float)item["y"]);
                var go=new GameObject(childName);go.transform.SetParent(marker.transform,false);go.transform.position=origin;var sr=go.AddComponent<SpriteRenderer>();sr.sprite=lookup["beach_waves/f000"];sr.sortingOrder=13;sr.drawMode=SpriteDrawMode.Sliced;sr.size=new Vector2(width,.36f);sr.color=new Color(1,1,1,.7f);go.AddComponent<Animator>().runtimeAnimatorController=art.controller;go.AddComponent<FarolPose>().animationName="beach_waves.loop";
                if(marker.category=="waveHits"){marker.requiresPort=false;marker.nextStep="Espuma com animação original beach_waves.loop.";}
            }
            EditorSceneManager.MarkSceneDirty(scene);EditorSceneManager.SaveScene(scene);return lookup.Count+" sprites conferidos; "+surfaces+" pisos ligados; NPCs, inimigos e encerramento preparados.";
        }
    }
}
