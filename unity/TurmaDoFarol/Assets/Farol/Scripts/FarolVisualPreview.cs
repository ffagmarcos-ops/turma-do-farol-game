using System.Collections;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.UIElements;
namespace TurmaDoFarol
{
    // A renderização e o save desta cena de comparação ficam isolados da campanha.
    [ExecuteAlways,DefaultExecutionOrder(-1000)]
    public sealed class FarolVisualPreview : MonoBehaviour
    {
        public RenderPipelineAsset fullPipeline,lightPipeline;public FarolWaterBody water;
        public bool fullQuality=true;public Vector2 spawn=new Vector2(616.8f,1.84f);public float cameraY=4.1f;
        [SerializeField] bool savedProgress;[SerializeField] string campaignSave,islandSave;
        [SerializeField] bool previousBackground,previousActorCollision,previousEnemyCollision;
        const string CampaignKey="farol.unity.campanha.v1",IslandKey="farol.unity.migracao.v1.fase3";
        void Awake(){Activate();}
        void OnEnable(){Activate();}
        public void Activate()
        {
            if(!fullPipeline||!lightPipeline)return;
            if(water)water.SetQuality(fullQuality);
            if(Application.isPlaying&&!savedProgress){campaignSave=PlayerPrefs.GetString(CampaignKey,"");islandSave=PlayerPrefs.GetString(IslandKey,"");previousBackground=Application.runInBackground;previousActorCollision=Physics2D.GetIgnoreLayerCollision(10,8);previousEnemyCollision=Physics2D.GetIgnoreLayerCollision(10,9);savedProgress=true;PlayerPrefs.SetString(CampaignKey,"{\"islandStarted\":true,\"resumeStage\":\"island\"}");PlayerPrefs.DeleteKey(IslandKey);Application.runInBackground=true;}
        }
        IEnumerator Start()
        {
            if(!Application.isPlaying)yield break;yield return null;
            var player=FindFirstObjectByType<FarolPlayerController>();player.Teleport(spawn);
            var dog=FindFirstObjectByType<FarolCompanion>();if(dog){dog.transform.position=spawn+Vector2.left*1.1f;dog.GetComponent<Rigidbody2D>().position=spawn+Vector2.left*1.1f;}
            var camera=Camera.main;camera.GetComponent<FarolCamera>().enabled=false;camera.transform.position=new Vector3(spawn.x+2,cameraY,-10);
            Physics2D.IgnoreLayerCollision(10,8,true);Physics2D.IgnoreLayerCollision(10,9,true);
        }
        public void SetQuality(bool full){fullQuality=full;Activate();}
        void Update(){if(Application.isPlaying&&Input.GetKeyDown(KeyCode.F8))SetQuality(!fullQuality);}
        void LateUpdate()
        {
            if(!Application.isPlaying)return;var camera=Camera.main;if(camera){var p=camera.transform.position;var player=FindFirstObjectByType<FarolPlayerController>();if(player)p.x=Mathf.Lerp(p.x,player.transform.position.x+2,1-Mathf.Exp(-7*Time.deltaTime));p.y=cameraY;camera.transform.position=p;}
            var campaign=FindFirstObjectByType<FarolCampaign>();if(campaign){var root=campaign.GetComponent<UIDocument>().rootVisualElement;var controls=root.Q<Label>("controls");if(controls!=null&&!controls.text.Contains("F8"))controls.text+=" · F8: água "+(fullQuality?"completa":"leve");}
        }
        void OnDisable()
        {
            if(savedProgress){Restore(CampaignKey,campaignSave);Restore(IslandKey,islandSave);PlayerPrefs.Save();Application.runInBackground=previousBackground;Physics2D.IgnoreLayerCollision(10,8,previousActorCollision);Physics2D.IgnoreLayerCollision(10,9,previousEnemyCollision);savedProgress=false;}
        }
        static void Restore(string key,string value){if(string.IsNullOrEmpty(value))PlayerPrefs.DeleteKey(key);else PlayerPrefs.SetString(key,value);}
    }
}
