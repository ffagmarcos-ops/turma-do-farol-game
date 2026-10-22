using System;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
namespace TurmaDoFarol.Editor
{
    public static class FarolRiachoArtIntegration
    {
        const string Folder="Assets/Farol/Visual/Bloco02/ArteAprovada/";
        public static void Import()
        {
            foreach(string path in AssetDatabase.FindAssets("t:Texture2D",new[]{Folder.TrimEnd('/')}).Select(AssetDatabase.GUIDToAssetPath))
            {
                var importer=(TextureImporter)AssetImporter.GetAtPath(path);
                importer.textureType=TextureImporterType.Sprite;importer.spriteImportMode=SpriteImportMode.Single;
                importer.spritePixelsPerUnit=100;importer.alphaIsTransparency=true;importer.mipmapEnabled=false;
                importer.filterMode=FilterMode.Bilinear;importer.wrapMode=TextureWrapMode.Clamp;importer.maxTextureSize=4096;
                importer.textureCompression=TextureImporterCompression.Uncompressed;importer.SaveAndReimport();
            }
        }
        static Sprite Load(string key){var sprite=AssetDatabase.LoadAssetAtPath<Sprite>(Folder+key+".png");if(!sprite)throw new InvalidOperationException("Imagem ausente: "+key);return sprite;}
        static void Replace(SpriteRenderer sr,string key)
        {
            var old=sr.bounds;var sprite=Load(key);sr.sprite=sprite;
            float scale=old.size.x/sprite.bounds.size.x;sr.transform.localScale=Vector3.one*scale;
            sr.transform.position=new Vector3(old.center.x,old.min.y+sprite.bounds.size.y*scale*.5f,0);
            sr.color=Color.white;sr.sortingOrder=12;
        }
        static void Stamp(Transform root,string key,float x,float bottom,float width,int alphaBottom,int order,bool pilot)
        {
            var sprite=Load(key);var go=new GameObject("Arte HQ — "+key);go.transform.SetParent(root,false);
            var sr=go.AddComponent<SpriteRenderer>();sr.sprite=sprite;
            sr.sharedMaterial=pilot?AssetDatabase.LoadAssetAtPath<Material>("Assets/Farol/Visual/Bloco01/PinturaSemAlterarCores.mat"):AssetDatabase.GetBuiltinExtraResource<Material>("Sprites-Default.mat");
            sr.sortingLayerName=order<0?"Farol Submerso":"Default";sr.sortingOrder=order;
            float scale=width/sprite.bounds.size.x;go.transform.localScale=Vector3.one*scale;
            float anchor=(sprite.texture.height*.5f-alphaBottom)/100;
            go.transform.position=new Vector3(x,bottom-anchor*scale,0);
        }
        public static string Apply()
        {
            if(EditorApplication.isPlaying)throw new InvalidOperationException("Saia do Play.");
            if(UnityEngine.SceneManagement.SceneManager.GetActiveScene().isDirty)throw new InvalidOperationException("Há alterações não salvas na cena aberta.");
            foreach(var path in new[]{"Assets/Farol/Campanha_20261021_215901/Fase3_Ilha.unity","Assets/Farol/Visual/Bloco01/Fase3_Referencia.unity"})
            {
                var scene=EditorSceneManager.OpenScene(path);bool pilot=path.Contains("Referencia");
                var old=GameObject.Find("Artes aprovadas — riacho");if(old)UnityEngine.Object.DestroyImmediate(old);
                var root=new GameObject("Artes aprovadas — riacho");
                foreach(var layer in UnityEngine.Object.FindObjectsByType<FarolParallaxLayer>(FindObjectsSortMode.None).Where(p=>p.x0<620&&p.x1>620))
                {
                    if(layer.name=="Fundo camada 3")
                    {
                        var sprite=Load("mata-intermediaria");layer.width=sprite.bounds.size.x;layer.verticalCenter=4.8f;
                        foreach(var sr in layer.panels){sr.sprite=sprite;sr.transform.localScale=Vector3.one;sr.color=new Color(.86f,.91f,.88f,1);}
                    }
                    if(layer.name=="Fundo camada 5"||layer.name=="Fundo camada 6")layer.gameObject.SetActive(false);
                }
                foreach(var m in UnityEngine.Object.FindObjectsByType<FarolSourceMarker>(FindObjectsSortMode.None).Where(m=>m.category=="decor"&&m.transform.position.x>=614.4f&&m.transform.position.x<691.2f))
                {
                    var sr=m.GetComponent<SpriteRenderer>();if(!sr)continue;
                    if(m.name=="Decoracao tree"){sr.enabled=false;continue;}
                    if(m.name=="Decoracao fern")Replace(sr,"samambaia");
                    if(m.name=="Decoracao bush")Replace(sr,"arbusto");
                    if(m.name=="Decoracao moss_rock")Replace(sr,"pedra-musgo-pequena");
                    if(m.name=="Decoracao roots")Replace(sr,"raizes");
                }
                // Complementos sem colisão: a borda de terra existente continua sendo o apoio.
                Stamp(root.transform,"capim",614.7f,1.7f,1.3f,462,12,pilot);
                Stamp(root.transform,"folhas-baixas",617.5f,1.7f,.9f,365,12,pilot);
                Stamp(root.transform,"juncos",619.05f,.6f,.9f,460,12,pilot);
                Stamp(root.transform,"pedra-musgo-grande",618.75f,.65f,1.1f,278,11,pilot);
                Stamp(root.transform,"pedras-submersas",621.1f,-.1f,1.6f,247,-10,pilot);
                Stamp(root.transform,"leito-pedregoso",624.3f,-.4f,3.2f,275,-10,pilot);
                Stamp(root.transform,"pedras-molhadas",628.5f,-.15f,2.2f,443,-10,pilot);
                Stamp(root.transform,"samambaia",631f,1.65f,1.25f,467,12,pilot);
                if(pilot)foreach(var t in UnityEngine.Object.FindObjectsByType<Transform>(FindObjectsSortMode.None).Where(t=>t.name=="Pedras visíveis sob a água"))t.gameObject.SetActive(false);
                EditorSceneManager.MarkSceneDirty(scene);EditorSceneManager.SaveScene(scene);
            }
            FarolVisualPreviewEditor.SyncNow();AssetDatabase.SaveAssets();return "Artes aprovadas aplicadas à campanha e à referência do riacho; colisões preservadas.";
        }
    }
}
