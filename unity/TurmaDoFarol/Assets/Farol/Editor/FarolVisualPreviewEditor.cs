using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;
namespace TurmaDoFarol.Editor
{
    // A troca ocorre no ciclo normal do Editor, depois das transições de cena e Play.
    [InitializeOnLoad]
    public static class FarolVisualPreviewEditor
    {
        const string OwnedKey="FarolVisualPipelineOwned", PreviousKey="FarolVisualPreviousPipeline";
        static double nextCheck;
        static bool ownsPipeline;
        static FarolVisualPreviewEditor()
        {
            ownsPipeline=SessionState.GetBool(OwnedKey,false);
            EditorApplication.update+=Update;
            EditorApplication.quitting+=Restore;
        }
        static void Update()
        {
            if(EditorApplication.timeSinceStartup<nextCheck||EditorApplication.isCompiling||EditorApplication.isUpdating||EditorApplication.isPlayingOrWillChangePlaymode!=EditorApplication.isPlaying)return;
            nextCheck=EditorApplication.timeSinceStartup+.25;
            SyncNow();
        }
        public static void SyncNow()
        {
            var preview=UnityEngine.Object.FindFirstObjectByType<FarolVisualPreview>();
            if(!preview||!preview.enabled){if(ownsPipeline)Restore();return;}
            if(!ownsPipeline)
            {
                var current=QualitySettings.renderPipeline;
                // Recupera também uma referência aberta antes da recompilação deste coordenador.
                string previous=current==preview.fullPipeline||current==preview.lightPipeline?"":AssetDatabase.GetAssetPath(current);
                SessionState.SetString(PreviousKey,previous);
                SessionState.SetBool(OwnedKey,true);
                ownsPipeline=true;
            }
            RenderPipelineAsset desired=preview.fullQuality?preview.fullPipeline:preview.lightPipeline;
            if(QualitySettings.renderPipeline!=desired)QualitySettings.renderPipeline=desired;
        }
        static void Restore()
        {
            if(!ownsPipeline)return;
            string previous=SessionState.GetString(PreviousKey,"");
            QualitySettings.renderPipeline=string.IsNullOrEmpty(previous)?null:AssetDatabase.LoadAssetAtPath<RenderPipelineAsset>(previous);
            ownsPipeline=false;SessionState.SetBool(OwnedKey,false);
            AssetDatabase.SaveAssets();
        }
    }
}
