using System;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
namespace TurmaDoFarol.Editor
{
 public static class FarolDEArtIntegration
 {
  public const string D="Assets/Farol/Visual/Bloco06Encosta/",E="Assets/Farol/Visual/Bloco07MataDensa/";
  public static void Import(){foreach(var path in AssetDatabase.FindAssets("t:Texture2D",new[]{D.TrimEnd('/'),E.TrimEnd('/')}).Select(AssetDatabase.GUIDToAssetPath)){var i=(TextureImporter)AssetImporter.GetAtPath(path);i.textureType=TextureImporterType.Sprite;i.spriteImportMode=SpriteImportMode.Single;i.spritePixelsPerUnit=100;i.alphaIsTransparency=true;i.mipmapEnabled=false;i.filterMode=FilterMode.Bilinear;i.wrapMode=TextureWrapMode.Clamp;i.maxTextureSize=4096;i.textureCompression=TextureImporterCompression.Uncompressed;i.SaveAndReimport();}}
  static Sprite Load(string path){var s=AssetDatabase.LoadAssetAtPath<Sprite>(path+".png");if(!s)throw new InvalidOperationException(path);return s;}
  public static void Panel(Transform root,Bounds b,string path){var g=new GameObject("Acabamento "+path.Split('/').Last());g.transform.SetParent(root,false);var sr=g.AddComponent<SpriteRenderer>();sr.sprite=Load(path);float scale=b.size.x/sr.sprite.bounds.size.x;g.transform.localScale=Vector3.one*scale;g.transform.position=new Vector3(b.center.x,b.max.y-sr.sprite.bounds.size.y*scale*.5f,0);sr.sortingOrder=6;}
  public static string Apply(){if(EditorApplication.isPlaying||UnityEngine.SceneManagement.SceneManager.GetActiveScene().isDirty)throw new InvalidOperationException("Salve e saia do Play.");foreach(var path in new[]{"Assets/Farol/Campanha_20261021_215901/Fase3_Ilha.unity","Assets/Farol/Visual/Bloco01/Fase3_Referencia.unity"}){
   var scene=EditorSceneManager.OpenScene(path);bool pilot=path.Contains("Referencia");var old=GameObject.Find("Encosta e mata densa — HQ");if(old)UnityEngine.Object.DestroyImmediate(old);var root=new GameObject("Encosta e mata densa — HQ");
   foreach(var l in UnityEngine.Object.FindObjectsByType<FarolParallaxLayer>(FindObjectsSortMode.None)){
    if(l.x0==0&&l.name=="Fundo camada 0")l.x1=384;
    if(Mathf.Abs(l.x0-153.6f)<.01f){if(l.name=="Fundo camada 1")l.x1=384;else if(l.name=="Fundo camada 3"){l.fadeOut=true;l.fadeDistance=5;}}
    bool d=Mathf.Abs(l.x0-230.4f)<.01f,e=Mathf.Abs(l.x0-307.2f)<.01f;if(!d&&!e)continue;if(l.name!="Fundo camada 3"){l.gameObject.SetActive(false);continue;}
    var s=Load(d?D+"camadas/cenarioD_3_encosta":E+"camadas/cenarioE_3_mata_densa");float scale=d?1.2f:1;l.width=s.bounds.size.x*scale*.9f;l.verticalCenter=1.8f+4.8f*scale;l.mirrorRepeat=true;l.fadeDistance=5;l.fadeIn=true;l.fadeOut=d;foreach(var p in l.panels){p.sprite=s;p.transform.localScale=Vector3.one*scale;p.color=d?new Color(.76f,.84f,.8f):new Color(.62f,.73f,.66f);p.sortingOrder=d?-32:-31;}
    if(e){var clearing=l.GetComponent<FarolClearingScenery>();if(!clearing)clearing=l.gameObject.AddComponent<FarolClearingScenery>();clearing.layer=l;}
   }
   var markers=UnityEngine.Object.FindObjectsByType<FarolSourceMarker>(FindObjectsSortMode.None);foreach(string sector in new[]{"D","E"}){string folder=sector=="D"?D:E;float offset=sector=="D"?230.4f:307.2f;int index=0;
    foreach(var m in markers.Where(m=>m.sector==sector&&m.category=="ground").OrderBy(m=>m.transform.position.x).ThenBy(m=>m.transform.position.y)){var c=m.GetComponent<Collider2D>();if(!c)continue;foreach(var sr in m.GetComponentsInChildren<SpriteRenderer>())sr.enabled=false;var b=c.bounds;bool rock=m.name.Contains("rock");bool roof=sector=="E"&&rock&&Mathf.Abs(b.size.y-.85f)<.02f;
     if(!roof)FarolBeachArtIntegration.Ground(root.transform,b,rock,index++,pilot,rock?FarolCoastArtIntegration.Folder:FarolForestArtIntegration.Folder,rock?"rocha_umida_topo":"terra_grama_topo",rock?"rocha_umida_meio":"terra_meio",meshFolder:folder);
     float local=b.min.x-offset;
     if(sector=="D"&&rock){string f=Mathf.Abs(local-9.6f)<.03f?"parede_D0":Mathf.Abs(local-64.4f)<.03f?"parede_D3":Mathf.Abs(local-45.8f)<.03f?"teto_D2":Mathf.Abs(local-50.4f)<.03f?"pilar_D2":null;if(f!=null)Panel(root.transform,b,D+"pecas/"+f);}
     if(roof)Panel(root.transform,b,E+"pecas/tronco_teto_"+Mathf.RoundToInt(b.size.x*100)+"x85");
    }
    foreach(var m in markers.Where(m=>m.sector==sector&&m.category=="platforms"))FarolForestArtIntegration.Platform(m,folder);
    foreach(var m in markers.Where(m=>m.sector==sector&&m.category=="decor")){var sr=m.GetComponent<SpriteRenderer>();if(!sr)continue;string n=m.name;string f=n.Contains("tree")?FarolForestArtIntegration.Folder+"pecas/arvore_floresta_420x720":n.Contains("roots")?FarolForestArtIntegration.Folder+"pecas/raizes_280x130":n.Contains("fern")?FarolBeachArtIntegration.Folder+"pecas/samambaia-costeira":n.Contains("bush")?FarolBeachArtIntegration.Folder+"pecas/arbusto-costeiro":n.Contains("rock")||n.Contains("boulder")||n.Contains("pebbles")?FarolCoastArtIntegration.Folder+"pecas/pedra-costao-musgo":n.Contains("vine")?E+"pecas/cipo_pendente_120x380":null;
     if(n.Contains("hollow_log")){FarolForestArtIntegration.Decor(sr,FarolForestArtIntegration.Folder+"pecas/raizes_280x130",12);sr.enabled=false;continue;}if(f!=null)FarolForestArtIntegration.Decor(sr,f,n.Contains("tree")||n.Contains("vine")?-4:12);
     float secret=sector=="D"?278.5f:342; if(Mathf.Abs(m.transform.position.x-secret)<3&&(n.Contains("roots")||n.Contains("bush")||n.Contains("tree"))){var fade=m.GetComponent<FarolSecretSceneryFade>();if(!fade)fade=m.gameObject.AddComponent<FarolSecretSceneryFade>();fade.visual=sr;fade.secretId=sector=="D"?"gruta-toninho":"tronco-secreto-e";fade.centerX=secret;}
     // A árvore ornamental sobre o fosso fica atrás da travessia, sem sugerir piso.
     if(sector=="D"&&n.Contains("tree")&&Mathf.Abs(m.transform.position.x-258.88f)<.1f)sr.sortingOrder=-34;
    }
   }
   var fg=UnityEngine.Object.FindFirstObjectByType<FarolBeachForeground>();if(fg)fg.sectorEnd=384;
   EditorSceneManager.MarkSceneDirty(scene);EditorSceneManager.SaveScene(scene);
  }FarolVisualBlockOne.OpenCampaign();AssetDatabase.SaveAssets();return "D/E aplicados nas duas cenas.";}
 }
}
