using UnityEngine;

namespace TurmaDoFarol
{
    [RequireComponent(typeof(Rigidbody2D),typeof(BoxCollider2D))]
    public sealed class FarolPlayerController : MonoBehaviour
    {
        public float walkSpeed=3.4f,runSpeed=5.8f,crouchSpeed=1.7f,jumpSpeed=10,acceleration=26;
        public float standingHeight=1.6728f,crouchingHeight=.9512f,bodyWidth=.7052f;
        public int maximumJumps=2;
        public bool useBiaAnimations=true;
        public Vector2 respawnPosition;
        public bool grounded {get; private set;}
        public int facing {get;private set;}=1;
        Rigidbody2D body; BoxCollider2D box; SpriteRenderer visual; Animator animator;
        float horizontal,jumpBufferUntil=-10,groundedAt=-10,lastThrow=-10,specialStarted=-1,invulnerableUntil;
        int jumps; bool crouching,jumpReleased,running; string pose;
        public Sprite projectileSprite;

        void Awake()
        {
            body=GetComponent<Rigidbody2D>();box=GetComponent<BoxCollider2D>();visual=GetComponent<SpriteRenderer>();animator=GetComponent<Animator>();
            body.freezeRotation=true;body.gravityScale=18f/9.81f;body.interpolation=RigidbodyInterpolation2D.Interpolate;
            body.collisionDetectionMode=CollisionDetectionMode2D.Continuous;
            if(respawnPosition==Vector2.zero)respawnPosition=transform.position;
            SetHeight(standingHeight);
        }
        void Update()
        {
            if(Time.timeScale==0)return;
            horizontal=(Input.GetKey(KeyCode.D)||Input.GetKey(KeyCode.RightArrow)?1:0)-(Input.GetKey(KeyCode.A)||Input.GetKey(KeyCode.LeftArrow)?1:0);
            running=Input.GetKey(KeyCode.LeftShift)||Input.GetKey(KeyCode.RightShift);
            bool low=Input.GetKey(KeyCode.S)||Input.GetKey(KeyCode.DownArrow);
            if(!low&&crouching) {
                var obstacle=Physics2D.OverlapBox((Vector2)transform.position+Vector2.up*(crouchingHeight+(standingHeight-crouchingHeight)/2),new Vector2(bodyWidth*.9f,standingHeight-crouchingHeight-.04f),0,1);
                low=obstacle!=null;
            }
            if(low!=crouching){crouching=low;SetHeight(low?crouchingHeight:standingHeight);}
            if(Input.GetKeyDown(KeyCode.Space)||Input.GetKeyDown(KeyCode.W)||Input.GetKeyDown(KeyCode.UpArrow))jumpBufferUntil=Time.time+.12f;
            if(Input.GetKeyUp(KeyCode.Space)||Input.GetKeyUp(KeyCode.W)||Input.GetKeyUp(KeyCode.UpArrow))jumpReleased=true;
            if(horizontal!=0){facing=horizontal>0?1:-1;if(visual)visual.flipX=facing<0;}
            if(useBiaAnimations&&(Input.GetKeyDown(KeyCode.Z)||Input.GetKeyDown(KeyCode.J))&&Time.time-lastThrow>.35f)ThrowShell();
            if(useBiaAnimations&&(Input.GetKeyDown(KeyCode.X)||Input.GetKeyDown(KeyCode.K)))specialStarted=Time.time;
            if(specialStarted>=0&&(Input.GetKeyUp(KeyCode.X)||Input.GetKeyUp(KeyCode.K))) {
                if(Time.time-specialStarted>=1.2f)foreach(var enemy in FindObjectsByType<FarolEnemy>(FindObjectsSortMode.None))if(Vector2.Distance(enemy.transform.position,transform.position)<8)enemy.Defeat();
                specialStarted=-1;
            }
            if(transform.position.y< -4)Respawn();
            string next=crouching?(Mathf.Abs(horizontal)>.1f?"bia.crawl":"bia.crouch_hold"):!grounded?(body.linearVelocity.y>1?"bia.jump":"bia.fall"):Mathf.Abs(horizontal)>.1f?(running?"bia.run":"bia.walk"):"bia.idle";
            if(useBiaAnimations&&Time.time-lastThrow>.3f)Play(next);
        }
        void FixedUpdate()
        {
            var hit=Physics2D.BoxCast((Vector2)transform.position+Vector2.up*.09f,new Vector2(bodyWidth*.85f,.08f),0,Vector2.down,.15f,1);
            grounded=hit.collider!=null&&body.linearVelocity.y<=.5f;
            if(grounded){groundedAt=Time.time;jumps=0;}
            var velocity=body.linearVelocity;
            velocity.x=Mathf.MoveTowards(velocity.x,horizontal*(crouching?crouchSpeed:running?runSpeed:walkSpeed),acceleration*Time.fixedDeltaTime);
            if(jumpBufferUntil>=Time.time&&!crouching&&(grounded||Time.time-groundedAt<.12f||jumps<maximumJumps)) {
                if(!grounded&&Time.time-groundedAt>=.12f&&jumps==0)jumps=1;
                velocity.y=jumpSpeed;jumps++;jumpBufferUntil=-10;groundedAt=-10;grounded=false;
            }
            if(jumpReleased&&velocity.y>0)velocity.y*=.45f;
            jumpReleased=false;velocity.y=Mathf.Max(velocity.y,-14);body.linearVelocity=velocity;
        }
        void SetHeight(float height){box.size=new Vector2(bodyWidth,height);box.offset=Vector2.up*height/2;}
        void Play(string name){if(!animator||pose==name||!animator.HasState(0,Animator.StringToHash(name)))return;pose=name;animator.Play(name);}
        void ThrowShell()
        {
            lastThrow=Time.time;Play(grounded?"bia.throw_stand":"bia.throw_air");
            var go=new GameObject("Concha arremessada");go.layer=2;go.transform.position=transform.position+new Vector3(facing*.65f,1.1f,0);
            var sr=go.AddComponent<SpriteRenderer>();sr.sprite=projectileSprite;sr.sortingOrder=25;
            if(sr.sprite)go.transform.localScale=Vector3.one*(.35f/Mathf.Max(.01f,sr.sprite.bounds.size.x));
            var shot=go.AddComponent<FarolProjectile>();shot.direction=facing;
        }
        public void Hurt(float fromX){if(Time.time<invulnerableUntil)return;invulnerableUntil=Time.time+1.4f;body.linearVelocity=new Vector2(transform.position.x<fromX?-4.2f:4.2f,4.4f);}
        public void Respawn(){body.position=respawnPosition;body.linearVelocity=Vector2.zero;invulnerableUntil=Time.time+1.4f;jumps=0;}
        public void Teleport(Vector2 position){respawnPosition=position;Respawn();}
    }
}
