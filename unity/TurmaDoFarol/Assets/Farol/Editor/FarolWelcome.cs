using UnityEditor;
using UnityEngine;
namespace TurmaDoFarol.Editor
{
    [InitializeOnLoad]
    public sealed class FarolWelcome : EditorWindow
    {
        static FarolWelcome(){EditorApplication.delayCall+=()=>{if(!Application.isBatchMode&&!SessionState.GetBool("FarolWelcome",false)){SessionState.SetBool("FarolWelcome",true);GetWindow<FarolWelcome>("Turma do Farol");}};}
        void OnGUI()
        {
            GUILayout.Label("Turma do Farol — migração para Unity",EditorStyles.boldLabel);
            EditorGUILayout.HelpBox("As artes e os dados foram preservados. Prepare o projeto para criar sprites, 69 animações e cenas editáveis. Esta é uma base de portabilidade: a equivalência completa com o jogo Phaser ainda precisa ser implementada e testada.",MessageType.Info);
            if(GUILayout.Button("Preparar projeto e abrir a ilha",GUILayout.Height(38)))FarolMigration.Prepare();
            if(GUILayout.Button("Abrir instruções e pendências"))FarolMigration.Instructions();
            GUILayout.Label("Também disponível no menu Turma do Farol.",EditorStyles.wordWrappedLabel);
        }
    }
}
