using System;
using System.Collections.Generic;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
namespace TurmaDoFarol.Editor
{
    public static class FarolBeachArtIntegration
    {
        public const string Folder="Assets/Farol/Visual/Bloco03Praia/";
        public static void Import()
        {
            foreach(var path in AssetDatabase.FindAssets("t:Texture2D",new[]{Folder.TrimEnd('/')}).Select(AssetDatabase.GUIDToAssetPath))
            {
                var i=(TextureImporter)AssetImporter.GetAtPath(path);i.textureType=TextureImporterType.Sprite;i.spriteImportMode=SpriteImportMode.Single;i.spritePixelsPerUnit=100;i.alphaIsTransparency=true;i.mipmapEnabled=false;i.filterMode=FilterMode.Bilinear;i.wrapMode=TextureWrapMode.Clamp;i.maxTextureSize=4096;i.textureCompression=TextureImporterCompression.Uncompressed;i.SaveAndReimport();
            }
        }
        static Sprite Sprite(string relative){var s=AssetDatabase.LoadAssetAtPath<Sprite>(Folder+relative+".png");if(!s)throw new InvalidOperationException(relative);return s;}
        static Material Material(string tile,bool pilot)
        {
            string path=Folder+"Materiais/"+tile+(pilot?"_URP":"_Padrao")+".mat";var m=AssetDatabase.LoadAssetAtPath<Material>(path);
            if(!m){m=new Material(Shader.Find(pilot?"Universal Render Pipeline/2D/Sprite-Unlit-Default":"Sprites/Default"));AssetDatabase.CreateAsset(m,path);}
            m.mainTexture=Sprite("tiles-candidatos/"+tile).texture;EditorUtility.SetDirty(m);return m;
        }
        // Cada repetição encontra sua própria borda espelhada: o desenho original não é alterado.
        static float Mirror(float v){return Mathf.PingPong(v,1);}
        sealed class Geometry
        {
            public readonly List<Vector3> vertices=new List<Vector3>();public readonly List<Vector2> uv=new List<Vector2>();public readonly List<Color> colors=new List<Color>();public readonly List<int> indices=new List<int>();
            public void Quad(float x0,float x1,float y0,float y1,float u0,float u1,float v0,float v1,float a0=1,float a1=1)
            {
                int n=vertices.Count;vertices.AddRange(new[]{new Vector3(x0,y0),new Vector3(x1,y0),new Vector3(x0,y1),new Vector3(x1,y1)});uv.AddRange(new[]{new Vector2(u0,v0),new Vector2(u1,v0),new Vector2(u0,v1),new Vector2(u1,v1)});colors.AddRange(new[]{new Color(1,1,1,a0),new Color(1,1,1,a0),new Color(1,1,1,a1),new Color(1,1,1,a1)});indices.AddRange(new[]{n,n+2,n+1,n+1,n+2,n+3});
            }
            public Mesh Mesh(){var m=new Mesh();m.SetVertices(vertices);m.SetUVs(0,uv);m.SetColors(colors);m.SetTriangles(indices,0);m.RecalculateBounds();return m;}
        }
        static void Render(Transform root,string name,Geometry geometry,Material material,int order)
        {
            string path=Folder+"Meshes/"+name+".asset";var mesh=geometry.Mesh();mesh.name=name;var saved=AssetDatabase.LoadAssetAtPath<Mesh>(path);if(saved){EditorUtility.CopySerialized(mesh,saved);UnityEngine.Object.DestroyImmediate(mesh);}else{saved=mesh;AssetDatabase.CreateAsset(saved,path);}var go=new GameObject(name);go.transform.SetParent(root,false);go.AddComponent<MeshFilter>().sharedMesh=saved;var r=go.AddComponent<MeshRenderer>();r.sharedMaterial=material;r.sortingOrder=order;r.sortingLayerName="Default";EditorUtility.SetDirty(saved);
        }
        static void Ground(Transform root,Bounds b,bool rock,int index,bool pilot)
        {
            const float unit=1.28f;float surface=rock?.08f:.12f,ceiling=b.max.y+surface;var cap=new Geometry();var fill=new Geometry();
            int first=Mathf.FloorToInt(b.min.x/unit),last=Mathf.CeilToInt(b.max.x/unit);
            for(int ix=first;ix<last;ix++)
            {
                float left=Mathf.Max(b.min.x,ix*unit),right=Mathf.Min(b.max.x,(ix+1)*unit),u0=Mirror(left/unit),u1=Mirror(right/unit);
                // UV da célula inteira é contínua também no recorte parcial da última coluna.
                float[] cuts={0,.35f,.75f,1.28f};
                for(int row=0;row<cuts.Length-1;row++)
                {
                    float a=cuts[row],z=Mathf.Min(cuts[row+1],ceiling-b.min.y);if(z<=a)continue;
                    float aa=b.size.y<1.15f?1:1-Mathf.InverseLerp(.35f,1.1f,a),az=b.size.y<1.15f?1:1-Mathf.InverseLerp(.35f,1.1f,z);
                    cap.Quad(left,right,ceiling-z,ceiling-a,u0,u1,1-z/unit,1-a/unit,az,aa);
                }
                float fillTop=b.max.y-.2f;
                for(float y=b.min.y;y<fillTop-.001f;)
                {
                    int cell=Mathf.FloorToInt(y/unit);float next=Mathf.Min(fillTop,(cell+1)*unit);if(next<=y+.00001f)next=Mathf.Min(fillTop,y+unit);
                    fill.Quad(left,right,y,next,u0,u1,Mirror(y/unit),Mirror(next/unit));y=next;
                }
            }
            if(fill.vertices.Count>0)Render(root,"Solo_"+index+"_Base",fill,Material(rock?"rocha_meio":"areia_meio",pilot),4);
            Render(root,"Solo_"+index+"_Topo",cap,Material(rock?"rocha_topo":"areia_topo",pilot),5);
        }
        static void Decor(SpriteRenderer sr,string file)
        {
            var old=sr.bounds;var s=Sprite("pecas/"+file);sr.sprite=s;float scale=old.size.y/s.bounds.size.y;sr.transform.localScale=Vector3.one*scale;sr.transform.position=new Vector3(old.center.x,old.min.y+s.bounds.size.y*scale*.5f,0);sr.color=Color.white;sr.sortingOrder=12;
        }
        public static string Apply()
        {
            if(EditorApplication.isPlaying||UnityEngine.SceneManagement.SceneManager.GetActiveScene().isDirty)throw new InvalidOperationException("A cena deve estar salva e fora do Play.");
            foreach(string path in new[]{"Assets/Farol/Campanha_20261021_215901/Fase3_Ilha.unity","Assets/Farol/Visual/Bloco01/Fase3_Referencia.unity"})
            {
                var scene=EditorSceneManager.OpenScene(path);bool pilot=path.Contains("Referencia");var existing=GameObject.Find("Praia — identidade HQ");if(existing)UnityEngine.Object.DestroyImmediate(existing);var root=new GameObject("Praia — identidade HQ");
                foreach(var layer in UnityEngine.Object.FindObjectsByType<FarolParallaxLayer>(FindObjectsSortMode.None).Where(p=>Mathf.Abs(p.x0)<.01f))
                {
                    string key=layer.name=="Fundo camada 0"?"cenarioA_0_ceu":layer.name=="Fundo camada 1"?"cenarioA_1_relevo":layer.name=="Fundo camada 2"?"cenarioA_2_mar_distante":layer.name=="Fundo camada 3"?"cenarioA_3_vegetacao":null;
                    if(key==null){layer.gameObject.SetActive(false);continue;}var s=Sprite("camadas/"+key);float scale=layer.name=="Fundo camada 3"?.55f:1;layer.width=38.4f*scale;layer.verticalCenter=layer.name=="Fundo camada 3"?4.44f:5.4f;layer.mirrorRepeat=true;
                    foreach(var panel in layer.panels){panel.sprite=s;panel.transform.localScale=Vector3.one*scale;panel.color=Color.white;}
                }
                var markers=UnityEngine.Object.FindObjectsByType<FarolSourceMarker>(FindObjectsSortMode.None).Where(m=>m.sector=="A").ToArray();
                int index=0;foreach(var m in markers.Where(m=>m.category=="ground").OrderBy(m=>m.transform.position.x).ThenBy(m=>m.transform.position.y))
                {
                    var collider=m.GetComponent<Collider2D>();if(!collider)continue;foreach(var sr in m.GetComponentsInChildren<SpriteRenderer>())sr.enabled=false;Ground(root.transform,collider.bounds,m.name.Contains("rock"),index++,pilot);
                }
                foreach(var m in markers.Where(m=>m.category=="decor"))
                {
                    var sr=m.GetComponent<SpriteRenderer>();if(!sr)continue;string name=m.name;
                    if(name.Contains("palm"))Decor(sr,"palmeira-costeira");else if(name.Contains("tree"))Decor(sr,"arvore-costeira");else if(name.Contains("bush"))Decor(sr,"arbusto-costeiro");else if(name.Contains("fern"))Decor(sr,"samambaia-costeira");else if(name.Contains("rock")||name.Contains("boulder")||name.Contains("pebbles"))Decor(sr,"pedras-secas");
                }
                EditorSceneManager.MarkSceneDirty(scene);EditorSceneManager.SaveScene(scene);
            }
            FarolVisualPreviewEditor.SyncNow();AssetDatabase.SaveAssets();return "Praia aplicada: quatro camadas, terreno com repetição espelhada e transição vertical suave, vegetação e rochas.";
        }
    }
}
