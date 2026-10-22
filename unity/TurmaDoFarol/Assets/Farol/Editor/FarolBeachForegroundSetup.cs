using System;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
namespace TurmaDoFarol.Editor
{
    public static class FarolBeachForegroundSetup
    {
        const string Folder="Assets/Farol/Visual/Bloco03Praia/";
        static SpriteRenderer Plant(Transform parent,string file,float width,bool flip,Material material)
        {
            var sprite=AssetDatabase.LoadAssetAtPath<Sprite>(Folder+"pecas/"+file+".png");if(!sprite)throw new InvalidOperationException(file);
            var go=new GameObject("Primeiro plano — "+file);go.transform.SetParent(parent,false);go.transform.localScale=Vector3.one*(width/sprite.bounds.size.x);
            var sr=go.AddComponent<SpriteRenderer>();sr.sprite=sprite;sr.sharedMaterial=material;sr.flipX=flip;sr.sortingOrder=60;sr.color=new Color(.88f,.93f,.85f,.75f);return sr;
        }
        public static string Apply()
        {
            if(EditorApplication.isPlaying||UnityEngine.SceneManagement.SceneManager.GetActiveScene().isDirty)throw new InvalidOperationException("A cena deve estar salva e fora do Play.");
            string materialPath=Folder+"Materiais/VegetacaoProximaDesfocada.mat";var material=AssetDatabase.LoadAssetAtPath<Material>(materialPath);
            if(!material){material=new Material(Shader.Find("Farol/Visual/VegetacaoProximaDesfocada"));AssetDatabase.CreateAsset(material,materialPath);}material.SetFloat("_BlurPixels",18);EditorUtility.SetDirty(material);
            foreach(var path in new[]{"Assets/Farol/Campanha_20261021_215901/Fase3_Ilha.unity","Assets/Farol/Visual/Bloco01/Fase3_Referencia.unity"})
            {
                var scene=EditorSceneManager.OpenScene(path);var old=GameObject.Find("Praia — primeiro plano");if(old)UnityEngine.Object.DestroyImmediate(old);
                var root=new GameObject("Praia — primeiro plano");var layer=root.AddComponent<FarolBeachForeground>();layer.lens=Camera.main;layer.player=UnityEngine.Object.FindFirstObjectByType<FarolPlayerController>().transform;
                layer.left=Plant(root.transform,"samambaia-costeira",4.8f,false,material);layer.right=Plant(root.transform,"palmeira-jovem",5.1f,true,material);
                EditorSceneManager.MarkSceneDirty(scene);EditorSceneManager.SaveScene(scene);
            }
            TurmaDoFarol.Editor.FarolVisualBlockOne.OpenCampaign();AssetDatabase.SaveAssets();return "Samambaia e palmeira jovem em primeiro plano desfocado, com centro livre.";
        }
    }
}
