using System;
using System.Linq;
using Newtonsoft.Json.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
namespace TurmaDoFarol.Editor
{
 public static class FarolFGArtIntegration
 {
  public const string F="Assets/Farol/Visual/Bloco08Clareira/",G="Assets/Farol/Visual/Bloco09Desfiladeiro/";
  public static void Import(){foreach(var path in AssetDatabase.FindAssets("t:Texture2D",new[]{F.TrimEnd('/'),G.TrimEnd('/')}).Select(AssetDatabase.GUIDToAssetPath)){var i=(TextureImporter)AssetImporter.GetAtPath(path);i.textureType=TextureImporterType.Sprite;i.spriteImportMode=SpriteImportMode.Single;i.spritePixelsPerUnit=100;i.alphaIsTransparency=true;i.mipmapEnabled=false;i.filterMode=FilterMode.Bilinear;i.wrapMode=TextureWrapMode.Clamp;i.maxTextureSize=4096;i.textureCompression=TextureImporterCompression.Uncompressed;i.SaveAndReimport();}}
  static Sprite Load(string p){var s=AssetDatabase.LoadAssetAtPath<Sprite>(p+".png");if(!s)throw new InvalidOperationException(p);return s;}
  static void Layer(FarolParallaxLayer l,Sprite s,float scale,float center,int order,Color color,float overlap=.9f){l.width=s.bounds.size.x*scale*overlap;l.verticalCenter=center;l.mirrorRepeat=true;l.fadeDistance=5;l.fadeIn=true;l.fadeOut=false;foreach(var p in l.panels){p.sprite=s;p.transform.localScale=Vector3.one*scale;p.color=color;p.sortingOrder=order;}}
  static void Suspension(FarolSourceMarker marker){var b=marker.GetComponent<Collider2D>().bounds;float local=b.min.x-460.8f;float top=Mathf.Abs(local-5.4f)<.1f?7.2f:Mathf.Abs(local-26.2f)<.1f?7:Mathf.Abs(local-51.6f)<.1f?8.8f:Mathf.Abs(local-64.4f)<.1f?8.2f:0;if(top==0)return;var art=marker.GetComponent<FarolHangingPlatformArt>();if(!art)art=marker.gameObject.AddComponent<FarolHangingPlatformArt>();art.support=marker.GetComponent<Collider2D>();art.leftAnchor=new Vector3(b.min.x+.22f,top,0);art.rightAnchor=new Vector3(b.max.x-.22f,top,0);LineRenderer Line(string name){var old=marker.transform.Find(name);if(old)UnityEngine.Object.DestroyImmediate(old.gameObject);var go=new GameObject(name);go.transform.SetParent(marker.transform,false);var l=go.AddComponent<LineRenderer>();l.useWorldSpace=true;l.positionCount=2;l.sharedMaterial=AssetDatabase.GetBuiltinExtraResource<Material>("Sprites-Default.mat");l.startWidth=l.endWidth=.06f;l.startColor=l.endColor=new Color(.55f,.4f,.21f);l.sortingOrder=10;return l;}art.left=Line("Corda de sustentação esquerda");art.right=Line("Corda de sustentação direita");art.left.SetPosition(0,art.leftAnchor);art.left.SetPosition(1,new Vector3(b.min.x+.22f,b.max.y,0));art.right.SetPosition(0,art.rightAnchor);art.right.SetPosition(1,new Vector3(b.max.x-.22f,b.max.y,0));}
  public static string Apply(){if(EditorApplication.isPlaying||UnityEngine.SceneManagement.SceneManager.GetActiveScene().isDirty)throw new InvalidOperationException("Salve e saia do Play.");foreach(var path in new[]{"Assets/Farol/Campanha_20261021_215901/Fase3_Ilha.unity","Assets/Farol/Visual/Bloco01/Fase3_Referencia.unity"}){
   var scene=EditorSceneManager.OpenScene(path);bool pilot=path.Contains("Referencia");var old=GameObject.Find("Clareira e desfiladeiro — HQ");if(old)UnityEngine.Object.DestroyImmediate(old);var root=new GameObject("Clareira e desfiladeiro — HQ");
   foreach(var l in UnityEngine.Object.FindObjectsByType<FarolParallaxLayer>(FindObjectsSortMode.None)){
    if(l.x0==0&&l.name=="Fundo camada 0")l.x1=537.6f;
    if(Mathf.Abs(l.x0-153.6f)<.01f&&l.name=="Fundo camada 1"){l.x1=460.8f;l.fadeOut=true;l.fadeDistance=5;}
    if(Mathf.Abs(l.x0-307.2f)<.01f&&l.name=="Fundo camada 3"){l.fadeOut=true;l.fadeDistance=5;}
    bool f=Mathf.Abs(l.x0-384)<.01f,g=Mathf.Abs(l.x0-460.8f)<.01f;if(!f&&!g)continue;
    if(f){if(l.name!="Fundo camada 3"){l.gameObject.SetActive(false);continue;}Layer(l,Load(FarolForestArtIntegration.Folder+"camadas/cenarioC_3_floresta"),.8f,5.64f,-30,new Color(.72f,.82f,.75f));l.fadeOut=true;}
    else if(l.name=="Fundo camada 1")Layer(l,Load(FarolCoastArtIntegration.Folder+"camadas/cenarioB_1_falesias"),1,5.4f,-42,new Color(.8f,.9f,.95f),1);
    else if(l.name=="Fundo camada 2")Layer(l,Load(FarolBeachArtIntegration.Folder+"camadas/cenarioA_2_mar_distante"),1,5.4f,-40,Color.white,1);
    else if(l.name=="Fundo camada 3")Layer(l,Load(G+"camadas/cenarioG_3_desfiladeiro"),1.1f,5.86f,-29,new Color(.68f,.8f,.82f));
    else l.gameObject.SetActive(false);
   }
   var markers=UnityEngine.Object.FindObjectsByType<FarolSourceMarker>(FindObjectsSortMode.None);foreach(string sector in new[]{"F","G"}){string folder=sector=="F"?F:G;float offset=sector=="F"?384:460.8f;var manifest=JArray.Parse(System.IO.File.ReadAllText(folder+"MANIFESTO.json"));int index=0;
    foreach(var m in markers.Where(m=>m.sector==sector&&m.category=="ground").OrderBy(m=>m.transform.position.x).ThenBy(m=>m.transform.position.y)){var c=m.GetComponent<Collider2D>();if(!c)continue;foreach(var sr in m.GetComponentsInChildren<SpriteRenderer>())sr.enabled=false;var b=c.bounds;bool rock=m.name.Contains("rock");FarolBeachArtIntegration.Ground(root.transform,b,rock,index++,pilot,rock?FarolCoastArtIntegration.Folder:FarolForestArtIntegration.Folder,rock?"rocha_umida_topo":"terra_grama_topo",rock?"rocha_umida_meio":"terra_meio",meshFolder:folder);
     var entry=manifest.FirstOrDefault(e=>e["posicao_mapa"]!=null&&!((string)e["arquivo"]).Contains("quebravel")&&Mathf.Abs((float)e["posicao_mapa"][0]/100+offset-b.min.x)<.03f&&Mathf.Abs((1080-(float)e["posicao_mapa"][1])/100-b.max.y)<.03f);if(entry!=null)FarolDEArtIntegration.Panel(root.transform,b,folder+((string)entry["arquivo"]).Replace(".png",""));
    }
    foreach(var m in markers.Where(m=>m.sector==sector&&m.category=="platforms")){float width=m.GetComponent<Collider2D>().bounds.size.x;FarolForestArtIntegration.Platform(m,width>1.9f?FarolDEArtIntegration.E:null);if(sector=="G")Suspension(m);}
    foreach(var m in markers.Where(m=>m.sector==sector&&m.category=="decor")){var sr=m.GetComponent<SpriteRenderer>();if(!sr)continue;string n=m.name;string file=n.Contains("tree")?FarolForestArtIntegration.Folder+"pecas/arvore_floresta_420x720":n.Contains("roots")?FarolForestArtIntegration.Folder+"pecas/raizes_280x130":n.Contains("fern")?FarolBeachArtIntegration.Folder+"pecas/samambaia-costeira":n.Contains("bush")?FarolBeachArtIntegration.Folder+"pecas/arbusto-costeiro":n.Contains("rock")||n.Contains("boulder")||n.Contains("pebbles")?FarolCoastArtIntegration.Folder+"pecas/pedra-costao-musgo":n.Contains("vine")?FarolDEArtIntegration.E+"pecas/cipo_pendente_120x380":null;if(file!=null)FarolForestArtIntegration.Decor(sr,file,n.Contains("tree")||n.Contains("vine")?-4:12);
     float secret=sector=="F"?418.5f:496.3f;if(Mathf.Abs(m.transform.position.x-secret)<3&&(n.Contains("roots")||n.Contains("bush")||n.Contains("tree"))){var fade=m.GetComponent<FarolSecretSceneryFade>();if(!fade)fade=m.gameObject.AddComponent<FarolSecretSceneryFade>();fade.visual=sr;fade.secretId=sector=="F"?"pedra-marina":"fenda-desfiladeiro";fade.centerX=secret;}
     // Pedra da clareira permanece atrás da caixa de Marina.
     if(sector=="F"&&Mathf.Abs(m.transform.position.x-395.2f)<.1f&&n.Contains("rock"))sr.sortingOrder=-3;
    }
   }
   // Material comum cobre suavemente a junta mineral do platô contínuo F3/G0.
   var seam=new Bounds();seam.SetMinMax(new Vector3(459.52f,-1.2f),new Vector3(462.08f,4.6f));int first=root.transform.childCount;FarolBeachArtIntegration.Ground(root.transform,seam,true,1000,pilot,FarolCoastArtIntegration.Folder,"rocha_umida_topo","rocha_umida_meio",meshFolder:G);for(int i=first;i<root.transform.childCount;i++){var t=root.transform.GetChild(i);var mesh=t.GetComponent<MeshFilter>().sharedMesh;var colors=mesh.colors;var vertices=mesh.vertices;for(int j=0;j<colors.Length;j++)colors[j].a*=Mathf.Clamp01(1-Mathf.Abs(vertices[j].x-460.8f)/1.28f);mesh.colors=colors;t.GetComponent<MeshRenderer>().sortingOrder+=4;EditorUtility.SetDirty(mesh);}
   var fg=UnityEngine.Object.FindFirstObjectByType<FarolBeachForeground>();if(fg)fg.sectorEnd=537.6f;EditorSceneManager.MarkSceneDirty(scene);EditorSceneManager.SaveScene(scene);
  }FarolVisualBlockOne.OpenCampaign();AssetDatabase.SaveAssets();return "F/G aplicados nas duas cenas.";}
 }
}
