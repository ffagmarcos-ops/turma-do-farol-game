using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolIslandRopes : MonoBehaviour
    {
        public TextAsset map;
        [Serializable] public sealed class Rope
        {
            public string id,helperId;public Vector2 anchor;public float length,currentLength,angle,angularVelocity;public bool deployed,deploying,canVault=true;public int ledgeDirection=1;
            public Rect zone;public Animator helper;public float triggeredAt=-1;public bool celebrated;
            [SerializeField] internal LineRenderer outer,inner;
        }
        public List<Rope> ropes=new List<Rope>();
        [SerializeField] int attachedIndex=-1;public Rope attached=>attachedIndex>=0&&attachedIndex<ropes.Count?ropes[attachedIndex]:null;[field:SerializeField] public float distance {get;private set;}
        FarolPlayerController player;FarolCampaign campaign;Rigidbody2D body;Material material;float cooldown;float horizontal,climb;bool jumpPressed;
        void OnEnable(){if(player){player.Interrupted-=Interrupt;player.Interrupted+=Interrupt;if(attached==null&&player.externallyDriven)player.EndRopeControl(Vector2.zero);}}
        void Start()
        {
            campaign=GetComponent<FarolCampaign>();player=FindFirstObjectByType<FarolPlayerController>();body=player.GetComponent<Rigidbody2D>();player.Interrupted+=Interrupt;
            material=new Material(Shader.Find("Sprites/Default"));var data=JObject.Parse(map.text);
            foreach(var chunk in data["chunks"]){foreach(var def in chunk["ropes"]??new JArray())Add(def,false);foreach(var def in chunk["triggers"]??new JArray())if((string)def["event"]=="helpZoneToninho")Add(def,true);}
        }
        void Add(JToken def,bool helper)
        {
            string id=(string)def["id"];var rope=new Rope{id=helper?id+"_rope":id,helperId=helper?id:null,anchor=FarolCoordinates.Point((float)def["ropeX"],(float)def["topY"]),length=Mathf.Max(1.2f,((float)def["bottomY"]-(float)def["topY"])/100),canVault=(bool?)def["canVaultTop"]??true,ledgeDirection=(int?)def["ledgeDir"]??1};
            rope.deployed=helper?FarolGameSession.Instance.EventSeen("toninho:"+id):(bool?)def["deployed"]??false;rope.deploying=rope.deployed;rope.currentLength=rope.deployed?rope.length:0;
            if(helper){rope.ledgeDirection=(float)def["ropeX"]<(float)def["toninhoX"]?1:-1;rope.zone=new Rect((float)def["x"]/100,(1080-(float)def["y"]-(float)def["h"])/100,(float)def["w"]/100,(float)def["h"]/100);var marker=FindObjectsByType<FarolSourceMarker>(FindObjectsSortMode.None).FirstOrDefault(m=>m.category=="helper"&&m.sourceId==id);rope.helper=marker?marker.GetComponent<Animator>():null;}
            var preview=FindObjectsByType<FarolSourceMarker>(FindObjectsSortMode.None).FirstOrDefault(m=>m.category=="ropes"&&m.sourceId==id);if(preview&&preview.TryGetComponent<SpriteRenderer>(out var sprite))sprite.enabled=false;
            rope.outer=Line(rope.id,.14f,new Color(.165f,.10f,.063f),11);rope.inner=Line(rope.id+" miolo",.08f,new Color(.847f,.69f,.424f),12);ropes.Add(rope);Draw(rope);
        }
        LineRenderer Line(string name,float width,Color color,int order){var go=new GameObject(name);go.transform.SetParent(transform,false);var line=go.AddComponent<LineRenderer>();line.sharedMaterial=material;line.positionCount=2;line.startWidth=line.endWidth=width;line.startColor=line.endColor=color;line.numCapVertices=4;line.sortingOrder=order;return line;}
        void Update()
        {
            if(!player||Time.timeScale==0)return;cooldown=Mathf.Max(0,cooldown-Time.deltaTime);
            horizontal=(Input.GetKey(KeyCode.D)||Input.GetKey(KeyCode.RightArrow)?1:0)-(Input.GetKey(KeyCode.A)||Input.GetKey(KeyCode.LeftArrow)?1:0);
            climb=(Input.GetKey(KeyCode.W)||Input.GetKey(KeyCode.UpArrow)?1:0)-(Input.GetKey(KeyCode.S)||Input.GetKey(KeyCode.DownArrow)?1:0);jumpPressed|=Input.GetKeyDown(KeyCode.Space);
            foreach(var rope in ropes)if(rope.helperId!=null)
            {
                if(rope.triggeredAt<0&&!rope.deployed&&rope.zone.Contains(player.transform.position))Trigger(rope);
                if(rope.triggeredAt>=0&&!rope.deploying){float t=Time.time-rope.triggeredAt;if(t>=.65f)Play(rope.helper,"toninho_throw_rope");if(t>=.65f+.2857143f){rope.deploying=true;campaign.Sfx("sfx_bell",.35f);}}
                if(rope.deployed&&!rope.celebrated&&player.transform.position.y>=rope.anchor.y-.24f&&Mathf.Abs(player.transform.position.x-rope.anchor.x)<3.4f){rope.celebrated=true;Play(rope.helper,"toninho_confirm");}
            }
            if(attached!=null)campaign.Prompt("Corda · ↑/↓ subir e descer · A/D balançar · A/D + Espaço saltar");
            else {jumpPressed=false;var near=ropes.FirstOrDefault(r=>r.currentLength>=.9f&&Mathf.Abs(player.transform.position.x-r.anchor.x)<.65f&&player.transform.position.y+.8f<=r.anchor.y+.1f&&player.transform.position.y+.8f>=r.anchor.y-r.currentLength-.36f);campaign.Prompt(near!=null?"↑ ou E · Agarrar a corda":"");if(near!=null&&(climb>0||Input.GetKeyDown(KeyCode.E)||!player.grounded))TryGrab(near);}
        }
        public void Trigger(Rope rope){if(rope.helperId==null||rope.triggeredAt>=0||rope.deployed)return;rope.triggeredAt=Time.time;FarolGameSession.Instance.RememberEvent("toninho:"+rope.helperId);Play(rope.helper,"toninho_brace");}
        static void Play(Animator animator,string pose){if(animator&&animator.HasState(0,Animator.StringToHash("Base Layer."+pose))&&animator.GetCurrentAnimatorStateInfo(0).shortNameHash!=Animator.StringToHash(pose))animator.Play(Animator.StringToHash("Base Layer."+pose),0,0);}
        public bool TryGrab(Rope rope)
        {
            if(attached!=null||cooldown>0||rope.currentLength<.9f)return false;float hand=player.transform.position.y+.8f;
            float d=Mathf.Clamp(rope.anchor.y-hand,.46f,rope.currentLength-.16f);float rx=rope.anchor.x+Mathf.Sin(rope.angle)*d;
            if(hand>rope.anchor.y+.1f||hand<rope.anchor.y-rope.currentLength-.36f||Mathf.Abs(player.transform.position.x-rx)>=.54f)return false;
            attachedIndex=ropes.IndexOf(rope);distance=d;rope.angularVelocity+=body.linearVelocity.x*.22f;player.BeginRopeControl();return true;
        }
        void FixedUpdate()
        {
            if(!player)return;float dt=Time.fixedDeltaTime;
            foreach(var rope in ropes){if(rope.deploying&&!rope.deployed){rope.currentLength=Mathf.Min(rope.length,rope.currentLength+9.2f*dt);rope.deployed=rope.currentLength>=rope.length;}rope.angularVelocity+=(-5.8f*Mathf.Sin(rope.angle)-rope.angularVelocity*(attached==rope?.85f:1.45f))*dt;rope.angle=Mathf.Clamp(rope.angle+rope.angularVelocity*dt,-.56f,.56f);Draw(rope);}
            if(attached==null)return;var r=attached;r.angularVelocity+=horizontal*3.4f*dt;distance=Mathf.Clamp(distance-climb*2.7f*dt,.38f,r.currentLength-.12f);
            body.position=new Vector2(r.anchor.x+Mathf.Sin(r.angle)*distance,r.anchor.y-Mathf.Cos(r.angle)*distance-.8f);body.linearVelocity=Vector2.zero;
            if(distance<=.42f&&climb>0&&r.canVault)Release(r.ledgeDirection,true);else if(jumpPressed&&horizontal!=0)Release(horizontal>0?1:-1,false);else if(distance>=r.currentLength-.14f&&climb<0)Release(0,false);jumpPressed=false;
        }
        public void Release(int direction,bool vault=false)
        {
            if(attached==null)return;var r=attached;attachedIndex=-1;cooldown=.42f;Vector2 velocity=Vector2.zero;
            if(vault){body.position=r.anchor+new Vector2(direction*.64f,.06f);velocity=new Vector2(direction*2.6f,2.8f);}else if(direction!=0)velocity=new Vector2(direction*5.4f+Mathf.Cos(r.angle)*r.angularVelocity*1.7f,9.6f);
            player.EndRopeControl(velocity);campaign.Prompt("");
        }
        void Interrupt(){Release(0,false);}
        static void Draw(Rope rope){Vector3 start=rope.anchor,end=rope.anchor+new Vector2(Mathf.Sin(rope.angle),-Mathf.Cos(rope.angle))*rope.currentLength;foreach(var line in new[]{rope.outer,rope.inner}){line.enabled=rope.currentLength>.04f;line.SetPosition(0,start);line.SetPosition(1,end);}}
        void OnDestroy(){if(player){if(attached!=null){attachedIndex=-1;player.EndRopeControl(Vector2.zero);}player.Interrupted-=Interrupt;}if(material)Destroy(material);}
    }
}
