using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolEnemy : MonoBehaviour
    {
        public bool monkey; public float minX,maxX,speed=1.3f;public FarolPlayerController player;
        Rigidbody2D body; int direction=1; float stunUntil;
        void Awake(){body=GetComponent<Rigidbody2D>();var anim=GetComponent<Animator>();if(anim)anim.Play(monkey?"monkey.idle":"crab.walk");}
        void FixedUpdate()
        {
            if(monkey||!body)return;
            if(transform.position.x>maxX)direction=-1;if(transform.position.x<minX)direction=1;
            var v=body.linearVelocity;v.x=Time.time<stunUntil?0:direction*speed;body.linearVelocity=v;
            var sr=GetComponent<SpriteRenderer>();if(sr)sr.flipX=direction<0;
        }
        void OnCollisionEnter2D(Collision2D c){var p=c.collider.GetComponent<FarolPlayerController>();if(p)p.Hurt(transform.position.x);}
        public void Stun(float duration){stunUntil=Time.time+duration;}
        public void Defeat(){Destroy(gameObject);}
    }
}
