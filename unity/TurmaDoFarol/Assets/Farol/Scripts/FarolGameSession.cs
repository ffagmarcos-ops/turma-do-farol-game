using System;
using System.Collections.Generic;
using UnityEngine;

namespace TurmaDoFarol
{
    [DefaultExecutionOrder(-200)]
    public sealed class FarolGameSession : MonoBehaviour
    {
        [Serializable] public class Save { public int shells;public List<string> collected=new List<string>();public bool hasCheckpoint;public float x,y; }
        public string stage="fase3";
        public FarolPlayerController player;
        public static FarolGameSession Instance {get;private set;}
        public Save progress=new Save();
        FarolCampaign campaign;
        string Key=>"farol.unity.migracao.v1."+stage;
        void Awake()
        {
            Instance=this;Time.timeScale=1;Physics2D.gravity=new Vector2(0,-9.81f);
            // Personagens não se empurram. Os contatos com inimigos usam a camada 9.
            Physics2D.IgnoreLayerCollision(8,8,true);
            string json=PlayerPrefs.GetString(Key,"");
            try{if(json.Length>0)progress=JsonUtility.FromJson<Save>(json)??new Save();}catch{progress=new Save();}
            if(progress.collected==null)progress.collected=new List<string>();
        }
        void Start(){campaign=FindFirstObjectByType<FarolCampaign>();if(player&&progress.hasCheckpoint)player.Teleport(new Vector2(progress.x,progress.y));}
        public bool Collected(string id)=>progress.collected.Contains(id);
        public void Collect(string id,int value){if(Collected(id))return;progress.collected.Add(id);progress.shells+=value;if(campaign)campaign.CollectIsland(id,value);Store();}
        public void Checkpoint(Vector2 p){progress.hasCheckpoint=true;progress.x=p.x;progress.y=p.y;if(player)player.respawnPosition=p;Store();}
        void Store(){PlayerPrefs.SetString(Key,JsonUtility.ToJson(progress));PlayerPrefs.Save();}
        void Update(){if(campaign)return;if(Input.GetKeyDown(KeyCode.Escape))Time.timeScale=Time.timeScale==0?1:0;}
        void OnDestroy(){if(Instance==this)Instance=null;Time.timeScale=1;}
        void OnGUI()
        {
            if(campaign)return;
            GUI.Box(new Rect(15,15,400,74),"Turma do Farol · "+stage+" · Conchas: "+progress.shells+"\nA/D: andar · Shift: correr · Espaço: pular\nS: agachar · Z: concha · X: carregar latido · Esc: pausa");
            if(Time.timeScale==0)GUI.Box(new Rect(Screen.width/2-150,Screen.height/2-35,300,70),"Pausado — Esc para continuar");
        }
    }
}
