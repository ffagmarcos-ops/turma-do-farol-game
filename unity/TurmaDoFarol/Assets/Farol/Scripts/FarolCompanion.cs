using UnityEngine;
namespace TurmaDoFarol
{
    [RequireComponent(typeof(Rigidbody2D),typeof(BoxCollider2D))]
    public sealed class FarolCompanion : MonoBehaviour
    {
        public FarolPlayerController player; Rigidbody2D body; Animator animator; SpriteRenderer visual;string pose;
        void Awake(){body=GetComponent<Rigidbody2D>();body.gravityScale=18f/9.81f;body.freezeRotation=true;body.interpolation=RigidbodyInterpolation2D.Interpolate;animator=GetComponent<Animator>();visual=GetComponent<SpriteRenderer>();}
        void FixedUpdate()
        {
            if(!player)return;
            float dx=player.transform.position.x-player.facing*1.2f-transform.position.x;
            bool ground=Physics2D.Raycast((Vector2)transform.position+Vector2.up*.1f,Vector2.down,.3f,1);
            var velocity=body.linearVelocity;velocity.x=Mathf.Abs(dx)>.4f?Mathf.Clamp(dx*3,-6.4f,6.4f):0;
            bool wall=Physics2D.Raycast((Vector2)transform.position+Vector2.up*.3f,Vector2.right*Mathf.Sign(dx),.6f,1);
            bool gap=!Physics2D.Raycast((Vector2)transform.position+new Vector2(Mathf.Sign(dx)*.6f,.2f),Vector2.down,.65f,1);
            if(ground&&Mathf.Abs(dx)>.5f&&(wall||gap||player.transform.position.y>transform.position.y+.8f))velocity.y=9;
            body.linearVelocity=velocity;
            if(Vector2.Distance(transform.position,player.transform.position)>12||transform.position.y< -4){body.position=(Vector2)player.transform.position+Vector2.left*player.facing;body.linearVelocity=Vector2.zero;}
            if(visual&&Mathf.Abs(dx)>.2f)visual.flipX=dx<0;
            string next=Mathf.Abs(velocity.x)>.2f?"faisca.run":"faisca.idle";
            if(animator&&next!=pose){pose=next;animator.Play(Animator.StringToHash("Base Layer."+next),0,0);}
        }
    }
}
