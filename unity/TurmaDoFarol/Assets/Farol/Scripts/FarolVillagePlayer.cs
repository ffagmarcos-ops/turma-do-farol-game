using UnityEngine;
namespace TurmaDoFarol
{
    [RequireComponent(typeof(Rigidbody2D),typeof(BoxCollider2D))]
    public sealed class FarolVillagePlayer : MonoBehaviour
    {
        public FarolCampaign campaign;[System.NonSerialized] public float testHorizontal;[System.NonSerialized] public bool testJump,testControls,testDown;
        public float levelWidth=143.36f;public bool locked,grounded,crouching;public int facing=1;
        Rigidbody2D body;BoxCollider2D box;FarolFlipbook flip;
        float buffered=-10,coyote=-10;bool cut;float step;
        public Vector2 Velocity=>body?body.linearVelocity:Vector2.zero;
        void Awake(){body=GetComponent<Rigidbody2D>();box=GetComponent<BoxCollider2D>();flip=GetComponent<FarolFlipbook>();body.gravityScale=18/9.81f;body.freezeRotation=true;body.interpolation=RigidbodyInterpolation2D.Interpolate;body.collisionDetectionMode=CollisionDetectionMode2D.Continuous;}
        void Update(){if(Time.timeScale==0)return;
            if(!locked&&(Input.GetKeyDown(KeyCode.Space)||Input.GetKeyDown(KeyCode.W)||Input.GetKeyDown(KeyCode.UpArrow)||testJump)){buffered=Time.time+.14f;testJump=false;}
            cut=Input.GetKeyUp(KeyCode.Space)||Input.GetKeyUp(KeyCode.W)||Input.GetKeyUp(KeyCode.UpArrow);
        }
        void FixedUpdate(){float input=locked?0:testControls?testHorizontal:testHorizontal!=0?testHorizontal:(Input.GetKey(KeyCode.D)||Input.GetKey(KeyCode.RightArrow)?1:0)-(Input.GetKey(KeyCode.A)||Input.GetKey(KeyCode.LeftArrow)?1:0);
            bool want=!locked&&(testControls?testDown:Input.GetKey(KeyCode.S)||Input.GetKey(KeyCode.DownArrow));
            if(!want&&crouching)want=Physics2D.OverlapBox((Vector2)transform.position+Vector2.up*2.07f,new Vector2(.95f,.52f),0,1)!=null;
            crouching=want;float height=want?1.75f:2.34f;box.size=new Vector2(1.06f,height);box.offset=Vector2.up*height/2;
            var hit=Physics2D.BoxCast((Vector2)transform.position+Vector2.up*.10f,new Vector2(.92f,.08f),0,Vector2.down,.17f,1);
            grounded=hit.collider!=null&&body.linearVelocity.y<=.5f;if(grounded)coyote=Time.time;
            bool run=Input.GetKey(KeyCode.LeftShift)||Input.GetKey(KeyCode.RightShift);
            float accel=campaign.stage=="village"&&transform.position.x>24.8f&&transform.position.x<32?7:18;
            var v=body.linearVelocity;v.x=Mathf.MoveTowards(v.x,input*(want?1.25f:run?3.6f:2.1f),accel*Time.fixedDeltaTime);
            if(!locked&&!want&&buffered>=Time.time&&Time.time-coyote<.12f){v.y=8.2f;buffered=-10;coyote=-10;grounded=false;campaign.Sfx("sfx_jump");}
            if(cut&&v.y>0)v.y*=.42f;cut=false;v.y=Mathf.Max(v.y,-14);body.linearVelocity=v;
            if(input!=0){facing=input>0?1:-1;GetComponent<SpriteRenderer>().flipX=facing<0;}
            string p=want?"crouch":!grounded?(v.y>0?"jump":"fall"):Mathf.Abs(v.x)>.1f?(run?"run":"walk"):"idle";flip.Play(p);
            if(grounded&&Mathf.Abs(v.x)>.2f){step-=Time.fixedDeltaTime;if(step<=0){campaign.Sfx(campaign.stage=="portals"?"sfx_step_wood_01":transform.position.x<20?"sfx_step_grass_01":transform.position.x<86?"sfx_step_stone_01":"sfx_step_wood_01",.35f);step=run?.26f:.39f;}}
            if(transform.position.y< -2)Teleport(campaign.checkpoint);
            var pos=body.position;pos.x=Mathf.Clamp(pos.x,.6f,levelWidth-.56f);body.position=pos;
        }
        public void Teleport(Vector2 p){if(!body)body=GetComponent<Rigidbody2D>();body.position=p;body.linearVelocity=Vector2.zero;buffered=-10;coyote=-10;}
    }
}
