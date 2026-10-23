using System;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
namespace TurmaDoFarol.Editor
{
    public static class FarolCoastArtIntegration
    {
        public const string Folder="Assets/Farol/Visual/Bloco04Costao/";
        public static void Import()
        {
            foreach(var path in AssetDatabase.FindAssets("t:Texture2D",new[]{Folder.TrimEnd('/')}).Select(AssetDatabase.GUIDToAssetPath))
            {
                var i=(TextureImporter)AssetImporter.GetAtPath(path);i.textureType=TextureImporterType.Sprite;i.spriteImportMode=SpriteImportMode.Single;i.spritePixelsPerUnit=100;i.alphaIsTransparency=true;i.mipmapEnabled=false;i.filterMode=FilterMode.Bilinear;i.wrapMode=TextureWrapMode.Clamp;i.maxTextureSize=4096;i.textureCompression=TextureImporterCompression.Uncompressed;i.SaveAndReimport();
            }
        }
        static Sprite Load(string relative){var s=AssetDatabase.LoadAssetAtPath<Sprite>(Folder+relative+".png");if(!s)throw new InvalidOperationException(relative);return s;}
        static void Decor(SpriteRenderer sr,string file)
        {
            var b=sr.bounds;var s=Load("pecas/"+file);float scale=b.size.y/s.bounds.size.y;sr.sprite=s;sr.transform.localScale=Vector3.one*scale;sr.transform.position=new Vector3(b.center.x,b.min.y+s.bounds.size.y*scale*.5f,0);sr.color=Color.white;sr.sortingOrder=12;
        }
        static void Platform(FarolSourceMarker marker,bool pilot)
        {
            var source=marker.GetComponent<SpriteRenderer>();var collider=marker.GetComponent<Collider2D>();if(!source||!collider)return;
            var old=marker.transform.Find("Laje HQ — visual");if(old)UnityEngine.Object.DestroyImmediate(old.gameObject);
            var surface=marker.GetComponent<FarolIslandSurface>();var sprite=Load("tiles-candidatos/"+(surface&&surface.crumble?"plataforma_pedra_instavel_intacta":"plataforma_pedra_molhada"));
            var b=collider.bounds;float scale=b.size.x/1.24f;var child=new GameObject("Laje HQ — visual");child.transform.position=new Vector3(b.center.x,b.max.y+(.06f-.32f)*scale,0);child.transform.localScale=Vector3.one*scale;child.transform.SetParent(marker.transform,true);
            var visual=child.AddComponent<SpriteRenderer>();visual.sprite=sprite;visual.sortingOrder=source.sortingOrder+1;visual.sortingLayerID=source.sortingLayerID;visual.sharedMaterial=source.sharedMaterial;
            var proxy=marker.GetComponent<FarolPlatformArt>();if(!proxy)proxy=marker.gameObject.AddComponent<FarolPlatformArt>();proxy.source=source;proxy.visual=visual;proxy.surface=surface;proxy.animator=surface?surface.animator:marker.GetComponent<Animator>();source.forceRenderingOff=true;
        }
        public static string Apply()
        {
            if(EditorApplication.isPlaying||UnityEngine.SceneManagement.SceneManager.GetActiveScene().isDirty)throw new InvalidOperationException("A cena deve estar salva e fora do Play.");
            foreach(string path in new[]{"Assets/Farol/Campanha_20261021_215901/Fase3_Ilha.unity","Assets/Farol/Visual/Bloco01/Fase3_Referencia.unity"})
            {
                var scene=EditorSceneManager.OpenScene(path);bool pilot=path.Contains("Referencia");var old=GameObject.Find("Costão — identidade HQ");if(old)UnityEngine.Object.DestroyImmediate(old);var root=new GameObject("Costão — identidade HQ");
                foreach(var layer in UnityEngine.Object.FindObjectsByType<FarolParallaxLayer>(FindObjectsSortMode.None))
                {
                    if(Mathf.Abs(layer.x0)<.01f)
                    {
                        if(layer.name=="Fundo camada 0"||layer.name=="Fundo camada 2")layer.x1=153.6f;
                        else if(layer.name=="Fundo camada 1"||layer.name=="Fundo camada 3"){layer.fadeDistance=5;layer.fadeOut=true;layer.fadeIn=false;}
                    }
                    else if(Mathf.Abs(layer.x0-76.8f)<.01f)
                    {
                        string file=layer.name=="Fundo camada 1"?"cenarioB_1_falesias":layer.name=="Fundo camada 3"?"cenarioB_3_costao":null;
                        if(file==null){layer.gameObject.SetActive(false);continue;}var sprite=Load("camadas/"+file);float scale=layer.name=="Fundo camada 3"?.6f:1;
                        layer.width=38.4f*scale;layer.verticalCenter=layer.name=="Fundo camada 3"?4.68f:5.4f;layer.mirrorRepeat=true;layer.fadeDistance=5;layer.fadeIn=true;layer.fadeOut=false;
                        foreach(var panel in layer.panels){panel.sprite=sprite;panel.transform.localScale=Vector3.one*scale;panel.color=Color.white;panel.sortingOrder=layer.name=="Fundo camada 1"?-44:-34;}
                    }
                }
                var markers=UnityEngine.Object.FindObjectsByType<FarolSourceMarker>(FindObjectsSortMode.None).Where(m=>m.sector=="B").ToArray();int index=0;
                foreach(var m in markers.Where(m=>m.category=="ground").OrderBy(m=>m.transform.position.x).ThenBy(m=>m.transform.position.y))
                {
                    var collider=m.GetComponent<Collider2D>();if(!collider)continue;foreach(var sr in m.GetComponentsInChildren<SpriteRenderer>())sr.enabled=false;
                    FarolBeachArtIntegration.Ground(root.transform,collider.bounds,true,index++,pilot,Folder,"rocha_umida_topo","rocha_umida_meio");
                }
                // Pedra entra progressivamente sobre os últimos quatro metros de areia, sem alterar o apoio.
                var end=UnityEngine.Object.FindObjectsByType<FarolSourceMarker>(FindObjectsSortMode.None).First(m=>m.sector=="A"&&m.category=="ground"&&m.transform.position.x>60);var bounds=end.GetComponent<Collider2D>().bounds;
                bounds.SetMinMax(new Vector3(72.8f,bounds.min.y,0),new Vector3(76.8f,bounds.max.y,0));FarolBeachArtIntegration.Ground(root.transform,bounds,true,1000,pilot,Folder,"rocha_umida_topo","rocha_umida_meio",72.8f,76.8f);
                foreach(var m in markers.Where(m=>m.category=="platforms"))Platform(m,pilot);
                foreach(var m in markers.Where(m=>m.category=="decor"))
                {
                    var sr=m.GetComponent<SpriteRenderer>();if(!sr)continue;
                    if(m.name.Contains("moss_rock"))Decor(sr,"pedra-costao-musgo");else if(m.name.Contains("boulder")||m.name.Contains("pebbles"))Decor(sr,"pedra-costao-umida");else if(m.name.Contains("bush"))Decor(sr,"arbusto-fenda");else if(m.name.Contains("fern"))Decor(sr,"samambaia-fenda");
                    else if(m.name.Contains("palm")){var beach=AssetDatabase.LoadAssetAtPath<Sprite>(FarolBeachArtIntegration.Folder+"pecas/palmeira-costeira.png");var b=sr.bounds;float scale=b.size.y/beach.bounds.size.y;sr.sprite=beach;sr.transform.localScale=Vector3.one*scale;sr.transform.position=new Vector3(b.center.x,b.min.y+beach.bounds.size.y*scale*.5f,0);sr.color=Color.white;sr.sortingOrder=12;}
                }
                var foreground=UnityEngine.Object.FindFirstObjectByType<FarolBeachForeground>();if(foreground)foreground.sectorEnd=153.6f;
                EditorSceneManager.MarkSceneDirty(scene);EditorSceneManager.SaveScene(scene);
            }
            FarolVisualBlockOne.OpenCampaign();AssetDatabase.SaveAssets();return "Costão aplicado com céu/mar compartilhados, transição gradual A–B, lajes e terreno sem mudar colisões.";
        }
    }
}
