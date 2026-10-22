using UnityEditor;
using UnityEngine;
namespace TurmaDoFarol.Editor
{
    // A partida de inspeção começa na praia e devolve o progresso ao sair do Play.
    [InitializeOnLoad]
    public static class FarolBeachPreviewMenu
    {
        static string Key=>"FarolPraiaPreview:"+Application.dataPath;
        const string Campaign="farol.unity.campanha.v1",Island="farol.unity.migracao.v1.fase3";
        static FarolBeachPreviewMenu()
        {
            EditorApplication.playModeStateChanged+=state=>{if(state==PlayModeStateChange.EnteredEditMode)Restore();};
            EditorApplication.quitting+=Restore;
            EditorApplication.delayCall+=()=>{if(!EditorApplication.isPlayingOrWillChangePlaymode)Restore();};
        }
        [MenuItem("Turma do Farol/Acabamento/Testar praia da HQ")]
        public static void Open()
        {
            if(EditorApplication.isPlaying)return;
            if(UnityEngine.SceneManagement.SceneManager.GetActiveScene().isDirty)throw new System.InvalidOperationException("Salve a cena aberta antes de testar a praia.");
            Restore();FarolVisualBlockOne.OpenCampaign();
            EditorPrefs.SetString(Key+":campaign",PlayerPrefs.GetString(Campaign,""));EditorPrefs.SetString(Key+":island",PlayerPrefs.GetString(Island,""));EditorPrefs.SetBool(Key+":background",Application.runInBackground);EditorPrefs.SetBool(Key+":active",true);
            PlayerPrefs.SetString(Campaign,"{\"islandStarted\":true,\"resumeStage\":\"island\"}");PlayerPrefs.DeleteKey(Island);Application.runInBackground=true;EditorApplication.isPlaying=true;
        }
        static void Restore()
        {
            if(!EditorPrefs.GetBool(Key+":active",false))return;
            foreach(var item in new[]{new[]{Campaign,":campaign"},new[]{Island,":island"}}){string value=EditorPrefs.GetString(Key+item[1],"");if(string.IsNullOrEmpty(value))PlayerPrefs.DeleteKey(item[0]);else PlayerPrefs.SetString(item[0],value);EditorPrefs.DeleteKey(Key+item[1]);}
            PlayerPrefs.Save();Application.runInBackground=EditorPrefs.GetBool(Key+":background",false);EditorPrefs.DeleteKey(Key+":background");EditorPrefs.DeleteKey(Key+":active");
        }
    }
}
