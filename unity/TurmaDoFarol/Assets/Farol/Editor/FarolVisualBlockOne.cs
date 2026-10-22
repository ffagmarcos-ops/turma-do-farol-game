using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
namespace TurmaDoFarol.Editor
{
    public static class FarolVisualBlockOne
    {
        const string Folder="Assets/Farol/Visual/Bloco01";
        static T Asset<T>(string name,Func<T> create) where T:UnityEngine.Object{string path=Folder+"/"+name;var asset=AssetDatabase.LoadAssetAtPath<T>(path);if(asset)return asset;asset=create();AssetDatabase.CreateAsset(asset,path);return asset;}
        static void SortingLayers()
        {
            var target=new SerializedObject(AssetDatabase.LoadAllAssetsAtPath("ProjectSettings/TagManager.asset")[0]);var layers=target.FindProperty("m_SortingLayers");
            foreach(var def in new[]{new[]{"Farol Submerso","153201"},new[]{"Farol Agua","153202"}}){if(Enumerable.Range(0,layers.arraySize).Any(i=>layers.GetArrayElementAtIndex(i).FindPropertyRelative("name").stringValue==def[0]))continue;int index=def[0]=="Farol Submerso"?0:1;layers.InsertArrayElementAtIndex(index);var layer=layers.GetArrayElementAtIndex(index);layer.FindPropertyRelative("name").stringValue=def[0];layer.FindPropertyRelative("uniqueID").intValue=int.Parse(def[1]);layer.FindPropertyRelative("locked").boolValue=false;}
            target.ApplyModifiedProperties();
        }
        static UniversalRenderPipelineAsset Pipeline(string name,bool capture)
        {
            var renderer=Asset(name+"_Renderer.asset",()=>ScriptableObject.CreateInstance<Renderer2DData>());
            var serial=new SerializedObject(renderer);serial.FindProperty("m_UseCameraSortingLayersTexture").boolValue=capture;serial.FindProperty("m_CameraSortingLayersTextureBound").intValue=SortingLayer.NameToID("Farol Submerso");serial.ApplyModifiedProperties();
            UnityEngine.Rendering.ResourceReloader.ReloadAllNullIn(renderer,"Packages/com.unity.render-pipelines.universal");
            var pipeline=Asset(name+".asset",()=>UniversalRenderPipelineAsset.Create(renderer));pipeline.renderScale=1;pipeline.msaaSampleCount=1;pipeline.supportsHDR=false;pipeline.supportsCameraOpaqueTexture=false;pipeline.supportsCameraDepthTexture=false;EditorUtility.SetDirty(renderer);EditorUtility.SetDirty(pipeline);return pipeline;
        }
        static void Shape(Transform parent,Sprite sprite,Vector2 position,float w,float h,string name,string layer,int order)
        {
            var go=new GameObject(name);go.transform.SetParent(parent,false);go.transform.position=position;var sr=go.AddComponent<SpriteRenderer>();sr.sprite=sprite;sr.sortingLayerName=layer;sr.sortingOrder=order;go.transform.localScale=new Vector3(w/sprite.bounds.size.x,h/sprite.bounds.size.y,1);
        }
        [MenuItem("Turma do Farol/Acabamento/Bloco 1 - Abrir referencia visual")]
        public static void OpenReference(){if(EditorApplication.isPlaying)throw new InvalidOperationException("Saia do Play.");EditorSceneManager.OpenScene(Folder+"/Fase3_Referencia.unity");}
        [MenuItem("Turma do Farol/Acabamento/Voltar a campanha")]
        public static void OpenCampaign(){if(EditorApplication.isPlaying)throw new InvalidOperationException("Saia do Play.");EditorSceneManager.OpenScene("Assets/Farol/Campanha_20261021_215901/Fase3_Ilha.unity");FarolVisualPreviewEditor.SyncNow();AssetDatabase.SaveAssets();}
        public static string Apply()
        {
            if(EditorApplication.isPlaying)throw new InvalidOperationException("Saia do Play antes de montar a referência.");
            SortingLayers();var original=EditorSceneManager.OpenScene("Assets/Farol/Campanha_20261021_215901/Fase3_Ilha.unity");EditorSceneManager.SaveScene(original,Folder+"/Fase3_Referencia.unity",true);EditorSceneManager.OpenScene(Folder+"/Fase3_Referencia.unity");
            var campaign=UnityEngine.Object.FindFirstObjectByType<FarolCampaign>();var full=Pipeline("AguaCompleta",true);var light=Pipeline("AguaLeve",false);
            var profile=Asset("PerfilIlha.asset",()=>ScriptableObject.CreateInstance<FarolWaterProfile>());
            var spriteMaterial=Asset("PinturaSemAlterarCores.mat",()=>new Material(Shader.Find("Universal Render Pipeline/2D/Sprite-Unlit-Default")));
            foreach(var sr in UnityEngine.Object.FindObjectsByType<SpriteRenderer>(FindObjectsSortMode.None)){
                sr.sharedMaterial=spriteMaterial;
                if(sr.sortingOrder<0){sr.sortingLayerName="Farol Submerso";sr.color=new Color(sr.color.r*.88f,sr.color.g*.94f,sr.color.b*.94f,sr.color.a);}
                if(sr.sortingOrder>=25&&(sr.GetComponentInParent<FarolParallaxLayer>()||sr.GetComponent<FarolSourceMarker>()?.category=="decor"))sr.color=new Color(sr.color.r,sr.color.g,sr.color.b,sr.color.a*.42f);
            }
            var source=UnityEngine.Object.FindObjectsByType<FarolSourceMarker>(FindObjectsSortMode.None).First(m=>m.category=="water"&&Mathf.Abs(m.transform.position.x-624.6f)<.1f);
            source.GetComponent<SpriteRenderer>().enabled=false;foreach(var sr in source.GetComponentsInChildren<SpriteRenderer>())sr.enabled=false;
            var root=GameObject.Find("Referencia visual — bloco 1");if(root)UnityEngine.Object.DestroyImmediate(root);root=new GameObject("Referencia visual — bloco 1");
            var waterNode=new GameObject("Água transparente — riacho existente");waterNode.layer=2;waterNode.transform.SetParent(root.transform,false);waterNode.transform.position=new Vector3(619.2f,1.34f,0);
            var water=waterNode.AddComponent<FarolWaterBody>();water.profile=profile;water.width=10.8f;water.depth=3;
            var mat=Asset("AguaTransparente.mat",()=>new Material(Shader.Find("Farol/Visual/Agua2D")));var mr=waterNode.GetComponent<MeshRenderer>();mr.sharedMaterial=mat;mr.sortingLayerName="Farol Agua";
            var volume=waterNode.AddComponent<BoxCollider2D>();volume.isTrigger=true;volume.usedByEffector=true;volume.size=new Vector2(water.width,water.depth);volume.offset=new Vector2(water.width/2,-water.depth/2);water.buoyancy=waterNode.AddComponent<BuoyancyEffector2D>();water.buoyancy.surfaceLevel=0;water.buoyancy.useColliderMask=true;water.buoyancy.colliderMask=1<<10;water.buoyancy.flowMagnitude=0;water.Build();
            var mesh=AssetDatabase.LoadAssetAtPath<Mesh>(Folder+"/Superficie.asset");if(!mesh){mesh=waterNode.GetComponent<MeshFilter>().sharedMesh;AssetDatabase.CreateAsset(mesh,Folder+"/Superficie.asset");}waterNode.GetComponent<MeshFilter>().sharedMesh=mesh;
            var ripples=waterNode.AddComponent<FarolWaterRipples>();ripples.material=spriteMaterial;
            var library=campaign.GetComponent<FarolIslandArt>();
            for(int i=0;i<4;i++)Shape(root.transform,library.Find("ruins_cave_tiles/f015"),new Vector2(620.4f+i*2.2f,.10f-i%2*.22f),1.1f,.40f,"Pedras visíveis sob a água","Farol Submerso",10);
            var floater=new GameObject("Caixa flutuante de referência");floater.layer=10;floater.transform.SetParent(root.transform,false);floater.transform.position=new Vector3(623.0f,2.8f,0);var body=floater.AddComponent<Rigidbody2D>();body.useAutoMass=true;body.interpolation=RigidbodyInterpolation2D.Interpolate;body.collisionDetectionMode=CollisionDetectionMode2D.Continuous;
            var collider=floater.AddComponent<BoxCollider2D>();collider.size=Vector2.one*.9f;collider.density=.65f;Shape(floater.transform,library.Find("crate"),floater.transform.position,.9f,.9f,"Desenho da caixa","Farol Submerso",20);var visual=floater.AddComponent<FarolFloatingVisual>();visual.profile=profile;visual.visual=floater.transform.GetChild(0);
            var preview=root.AddComponent<FarolVisualPreview>();preview.fullPipeline=full;preview.lightPipeline=light;preview.water=water;preview.Activate();FarolVisualPreviewEditor.SyncNow();
            var camera=Camera.main;var additional=camera.GetComponent<UniversalAdditionalCameraData>();if(!additional)additional=camera.gameObject.AddComponent<UniversalAdditionalCameraData>();additional.renderPostProcessing=false;additional.requiresColorTexture=false;additional.requiresDepthTexture=false;
            camera.transform.position=new Vector3(618.8f,4.1f,-10);PrefabUtility.SaveAsPrefabAssetAndConnect(waterNode,Folder+"/AguaRiacho.prefab",InteractionMode.AutomatedAction);PrefabUtility.SaveAsPrefabAssetAndConnect(floater,Folder+"/CaixaFlutuante.prefab",InteractionMode.AutomatedAction);EditorUtility.SetDirty(profile);AssetDatabase.SaveAssets();EditorSceneManager.MarkSceneDirty(root.scene);EditorSceneManager.SaveScene(root.scene);return "Referência do riacho montada: água, captura 2D, pedras submersas, caixa com empuxo e dois perfis.";
        }
    }
}
