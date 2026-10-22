using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolEnemy : MonoBehaviour
    {
        public bool monkey;public float minX,maxX,speed=.9f;public FarolPlayerController player;
        public string id;public int health=2;public string state="idle";public int stonesThrown;public bool alive=>state!="defeated";
        Rigidbody2D body;Animator animator;SpriteRenderer visual;FarolIslandMechanics island;
        int direction=1;float remaining,cooldown=.7f;bool released;Vector2 aim;GameObject warning;
        public bool stunned=>state=="stun";
        void Start(){body=GetComponent<Rigidbody2D>();animator=GetComponent<Animator>();visual=GetComponent<SpriteRenderer>();island=FindFirstObjectByType<FarolIslandMechanics>();var marker=GetComponent<FarolSourceMarker>();if(string.IsNullOrEmpty(id)&&marker){var data=Newtonsoft.Json.Linq.JObject.Parse(marker.originalJson);id=marker.sector+":"+(string)data["type"]+":"+((float)data["x"]).ToString(System.Globalization.CultureInfo.InvariantCulture)+":"+((float?)data["y"]??0).ToString(System.Globalization.CultureInfo.InvariantCulture);}if(!string.IsNullOrEmpty(id)&&FarolGameSession.Instance&&FarolGameSession.Instance.EventSeen("enemy:"+id)){gameObject.SetActive(false);return;}if(!player)player=FindFirstObjectByType<FarolPlayerController>();SetState(monkey?"idle":"patrol",0);}
        void SetState(string value,float duration){state=value;remaining=duration;released=false;string pose=monkey?(value=="watch"?"notice":value=="pick"?"pickup":value=="laugh"?"taunt":value=="stun"?"stun_hanging":value=="defeated"?"hurt":value):(value=="patrol"?"walk":value=="notice"||value=="recover"?"idle":value=="raise"?"alert":value=="defeated"?"defeat":value);FarolIslandArt.Play(animator,(monkey?"monkey.":"crab.")+pose);}
        void Update()
        {
            if(!player||!alive||Time.timeScale==0)return;
            if(Mathf.Abs(player.transform.position.x-transform.position.x)>24){if(body&&!monkey)body.linearVelocity=new Vector2(0,body.linearVelocity.y);return;}
            remaining-=Time.deltaTime;cooldown-=Time.deltaTime;
            if(state=="stun"||state=="hurt"){if(remaining<=0){SetState(monkey?"idle":"recover",.4f);cooldown=1.1f;}return;}
            float dx=player.transform.position.x-transform.position.x,dy=player.transform.position.y-transform.position.y;
            if(monkey){
                if(state=="idle"&&Mathf.Abs(dx)<8.4f&&Mathf.Abs(dy)<5.2f&&cooldown<=0){direction=dx<0?-1:1;SetState("watch",.45f);}
                else if(state=="watch"&&remaining<=0)SetState("pick",.42f);
                else if(state=="pick"&&remaining<=0){aim=(Vector2)player.transform.position;aim.x=transform.position.x+Mathf.Clamp(dx+player.GetComponent<Rigidbody2D>().linearVelocity.x*.22f,-6.6f,6.6f);if(island)warning=island.Warning(aim);SetState("aim",.68f);FarolIslandArt.Play(animator,"monkey.notice");}
                else if(state=="aim"&&remaining<=0)SetState("throw",.5f);
                else if(state=="throw"){if(!released&&remaining<=.1f){released=true;stonesThrown++;if(island)island.ThrowStone((Vector2)transform.position+new Vector2(direction*.24f,.96f),aim);ClearWarning();}if(remaining<=0)SetState("laugh",.9f);}
                else if(state=="laugh"&&remaining<=0){SetState("idle",0);cooldown=1.1f;}
            }else{
                if(state=="patrol"&&Mathf.Abs(dx)<4.6f&&Mathf.Abs(dy)<1.7f&&cooldown<=0){direction=dx<0?-1:1;SetState("notice",.3f);}
                else if(state=="notice"&&remaining<=0)SetState("raise",.5f);
                else if(state=="raise"&&remaining<=0){direction=dx<0?-1:1;SetState("attack",.5f);}
                else if(state=="attack"&&remaining<=0)SetState("recover",.7f);
                else if(state=="recover"&&remaining<=0){SetState("patrol",0);cooldown=1.2f;}
            }
            visual.flipX=direction<0;
        }
        void FixedUpdate()
        {
            if(monkey||!body||!alive)return;
            if(player&&Mathf.Abs(player.transform.position.x-transform.position.x)>24){body.linearVelocity=new Vector2(0,body.linearVelocity.y);return;}
            bool grounded=Physics2D.Raycast((Vector2)transform.position+Vector2.up*.12f,Vector2.down,.3f,1);
            bool edge=grounded&&!Physics2D.Raycast((Vector2)transform.position+new Vector2(direction*.5f,.2f),Vector2.down,.8f,1);
            bool wall=Physics2D.Raycast((Vector2)transform.position+Vector2.up*.25f,Vector2.right*direction,.55f,1);
            if(state=="patrol"&&(transform.position.x>maxX||transform.position.x<minX||edge||wall))direction=transform.position.x>maxX?-1:transform.position.x<minX?1:-direction;
            float vx=state=="patrol"?direction*speed:state=="attack"&&!edge&&!wall?direction*4.3f:0;
            body.linearVelocity=new Vector2(vx,body.linearVelocity.y);
        }
        void OnCollisionEnter2D(Collision2D c){Contact(c.collider);}void OnCollisionStay2D(Collision2D c){Contact(c.collider);}
        void Contact(Collider2D c){if(!alive||state=="stun"||state=="hurt"||(state=="attack"&&(remaining>.333f||remaining<.167f)))return;var p=c.GetComponent<FarolPlayerController>();if(p)p.Hurt(transform.position.x);}
        public void Stun(float duration){if(!alive)return;ClearWarning();SetState("stun",duration);if(body)body.linearVelocity=Vector2.zero;}
        public void Hit(float fromX){if(!alive||state=="hurt")return;health--;if(health<=0||(monkey&&stunned)){Defeat();return;}ClearWarning();SetState("hurt",monkey?.35f:.4f);}
        public void Defeat(){if(!alive)return;if(!string.IsNullOrEmpty(id)&&FarolGameSession.Instance)FarolGameSession.Instance.RememberEvent("enemy:"+id);ClearWarning();SetState("defeated",1.3f);foreach(var c in GetComponents<Collider2D>())c.enabled=false;if(body){body.bodyType=RigidbodyType2D.Dynamic;body.gravityScale=1.8f;body.freezeRotation=false;body.linearVelocity=new Vector2(direction*4.8f,9.6f);body.angularVelocity=direction*680;}Destroy(gameObject,1.7f);}
        void ClearWarning(){if(warning)Destroy(warning);warning=null;}void OnDestroy(){ClearWarning();}
    }
}
