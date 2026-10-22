using UnityEngine;
namespace TurmaDoFarol
{
    [RequireComponent(typeof(Rigidbody2D),typeof(BoxCollider2D))]
    public sealed class FarolCompanion : MonoBehaviour
    {
        public FarolPlayerController player; Rigidbody2D body; Animator animator; SpriteRenderer visual;string pose;float actionUntil;bool detouring;float detourStartX;Vector2 detourPath,reunion;
        void Awake(){body=GetComponent<Rigidbody2D>();body.gravityScale=18f/9.81f;body.freezeRotation=true;body.interpolation=RigidbodyInterpolation2D.Interpolate;animator=GetComponent<Animator>();visual=GetComponent<SpriteRenderer>();}
        public void Detour(Vector2 path,Vector2 destination){detouring=true;detourStartX=player?player.transform.position.x:path.x;detourPath=path;reunion=destination;}
        public void Action(string name,float duration){actionUntil=Time.time+duration;if(pose!=name){pose=name;FarolIslandArt.Play(animator,name);}}
        void FixedUpdate()
        {
            if(!player)return;
            if(detouring&&player.transform.position.x<detourStartX-1)detouring=false;
            float targetX=player.transform.position.x-player.facing*1.2f;
            if(detouring){if(player.transform.position.x<reunion.x-.6f)targetX=detourPath.x;else{body.position=reunion;body.linearVelocity=Vector2.zero;detouring=false;}}
            float dx=targetX-transform.position.x;
            bool ground=Physics2D.Raycast((Vector2)transform.position+Vector2.up*.1f,Vector2.down,.3f,1);
            var velocity=body.linearVelocity;velocity.x=Mathf.Abs(dx)>.4f?Mathf.Clamp(dx*3,-6.4f,6.4f):0;
            bool wall=Physics2D.Raycast((Vector2)transform.position+Vector2.up*.3f,Vector2.right*Mathf.Sign(dx),.6f,1);
            bool gap=!Physics2D.Raycast((Vector2)transform.position+new Vector2(Mathf.Sign(dx)*.6f,.2f),Vector2.down,.65f,1);
            if(ground&&Mathf.Abs(dx)>.5f&&(wall||gap||player.transform.position.y>transform.position.y+.8f))velocity.y=9;
            body.linearVelocity=velocity;
            if(Vector2.Distance(transform.position,player.transform.position)>12||transform.position.y< -4){body.position=(Vector2)player.transform.position+Vector2.left*player.facing;body.linearVelocity=Vector2.zero;}
            if(visual&&Mathf.Abs(dx)>.2f)visual.flipX=dx<0;
            string next=Mathf.Abs(velocity.x)>.2f?"faisca.run":"faisca.idle";
            if(Time.time<actionUntil)return;
            if(animator&&next!=pose){pose=next;animator.Play(Animator.StringToHash("Base Layer."+next.Replace('.','_')),0,0);}
        }
    }
}
