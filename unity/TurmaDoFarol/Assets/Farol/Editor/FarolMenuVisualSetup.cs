using System;
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
namespace TurmaDoFarol.Editor
{
    public static class FarolMenuVisualSetup
    {
        public static string Configure()
        {
            if(EditorApplication.isPlaying)throw new InvalidOperationException("Saia do Play antes de preparar o menu.");
            int count=0;foreach(string path in Directory.GetFiles("Assets/Originais/farol/fase3/ui/botoes","*.png"))
            {
                var importer=(TextureImporter)AssetImporter.GetAtPath(path);importer.textureShape=TextureImporterShape.Texture2D;importer.textureType=TextureImporterType.Default;importer.maxTextureSize=2048;importer.textureCompression=TextureImporterCompression.Uncompressed;importer.mipmapEnabled=false;importer.alphaIsTransparency=true;importer.filterMode=FilterMode.Bilinear;importer.SaveAndReimport();count++;
            }
            AssetDatabase.ImportAsset("Assets/Farol/UI/Campanha.uss",ImportAssetOptions.ForceUpdate);AssetDatabase.ImportAsset("Assets/Farol/UI/Campanha.uxml",ImportAssetOptions.ForceUpdate);
            foreach(string guid in AssetDatabase.FindAssets("t:FarolCampaignAssets")){var assets=AssetDatabase.LoadAssetAtPath<FarolCampaignAssets>(AssetDatabase.GUIDToAssetPath(guid));if(assets)assets.InvalidateCache();}
            return count+" imagens de botões importadas; interface e molduras atualizadas.";
        }
    }
}
