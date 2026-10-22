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
        Rigidbody2D body,supportBody;Vector2 supportPosition; BoxCollider2D box; SpriteRenderer visual; Animator animator;
        float horizontal,jumpBufferUntil=-10,groundedAt=-10,lastThrow=-10,specialStarted=-1,invulnerableUntil;
        int jumps; bool crouching,jumpReleased,running;bool locked;float slipperyUntil,actionUntil,pendingThrow=-1;System.Action discovery;FarolIslandMechanics island; string pose;
        public Sprite projectileSprite;
        public bool externallyDriven {get;private set;}public event System.Action Interrupted;

        void Awake()
        {
            body=GetComponent<Rigidbody2D>();box=GetComponent<BoxCollider2D>();visual=GetComponent<SpriteRenderer>();animator=GetComponent<Animator>();
            body.freezeRotation=true;body.gravityScale=18f/9.81f;body.interpolation=RigidbodyInterpolation2D.Interpolate;
            body.collisionDetectionMode=CollisionDetectionMode2D.Continuous;
            if(respawnPosition==Vector2.zero)respawnPosition=transform.position;
            SetHeight(standingHeight);island=FindFirstObjectByType<FarolIslandMechanics>();
        }
        void Update()
        {
            if(Time.timeScale==0||externallyDriven||locked)return;
            if(!island)island=FindFirstObjectByType<FarolIslandMechanics>();
            if(pendingThrow>=0&&Time.time>=pendingThrow){pendingThrow=-1;SpawnShell();}
            if(discovery!=null){if(Time.time>=actionUntil){var done=discovery;discovery=null;done();}else{horizontal=0;return;}}
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
            if(useBiaAnimations&&(Input.GetKeyDown(KeyCode.X)||Input.GetKeyDown(KeyCode.K))&&grounded&&Time.time>=invulnerableUntil&&(!island||island.CanBark))specialStarted=Time.time;
            if(specialStarted>=0){if(!grounded){specialStarted=-1;if(island)island.CancelCharge();}else if(island)island.Charge(Mathf.Clamp01((Time.time-specialStarted)/1.5f));}
            if(specialStarted>=0&&(Input.GetKeyUp(KeyCode.X)||Input.GetKeyUp(KeyCode.K))) {
                if(Time.time-specialStarted>=1.5f&&island)island.FireBark();else if(island)island.CancelCharge();
                specialStarted=-1;
            }
            if(transform.position.y< -4)Respawn();
            string next=crouching?(Mathf.Abs(horizontal)>.1f?"bia.crawl":"bia.crouch_hold"):!grounded?(body.linearVelocity.y>1?"bia.jump":"bia.fall"):Mathf.Abs(horizontal)>.1f?(running?"bia.run":"bia.walk"):"bia.idle";
            if(useBiaAnimations&&Time.time-lastThrow>.42f)Play(next);
        }
        void FixedUpdate()
        {
            if(externallyDriven)return;
            if(locked){body.linearVelocity=Vector2.zero;return;}
            var hit=Physics2D.BoxCast((Vector2)transform.position+Vector2.up*.09f,new Vector2(bodyWidth*.85f,.08f),0,Vector2.down,.15f,1);
            Vector2 carry=hit.rigidbody&&hit.rigidbody==supportBody?hit.rigidbody.position-supportPosition:Vector2.zero;
            Vector2 support=carry/Time.fixedDeltaTime;
            grounded=hit.collider!=null&&body.linearVelocity.y-support.y<=.5f;
            if(grounded){groundedAt=Time.time;jumps=0;body.position+=new Vector2(carry.x,0);}
            supportBody=grounded?hit.rigidbody:null;if(supportBody)supportPosition=supportBody.position;
            var velocity=body.linearVelocity;
            velocity.x=Mathf.MoveTowards(velocity.x,horizontal*(crouching?crouchSpeed:running?runSpeed:walkSpeed),(Time.time<slipperyUntil?6:acceleration)*Time.fixedDeltaTime);
            if(jumpBufferUntil>=Time.time&&!crouching&&(grounded||Time.time-groundedAt<.12f||jumps<maximumJumps)) {
                if(!grounded&&Time.time-groundedAt>=.12f&&jumps==0)jumps=1;
                velocity.y=jumpSpeed;jumps++;jumpBufferUntil=-10;groundedAt=-10;grounded=false;
            }
            if(jumpReleased&&velocity.y>0)velocity.y*=.45f;
            jumpReleased=false;velocity.y=Mathf.Max(velocity.y,-14);body.linearVelocity=velocity;
        }
        void SetHeight(float height){box.size=new Vector2(bodyWidth,height);box.offset=Vector2.up*height/2;}
        void Play(string name){if(!animator||pose==name||!animator.HasState(0,Animator.StringToHash("Base Layer."+name.Replace('.','_'))))return;pose=name;animator.Play(Animator.StringToHash("Base Layer."+name.Replace('.','_')),0,0);}
        public void ThrowShell()
        {
            if(locked||externallyDriven||Time.time-lastThrow<.5f||FindObjectsByType<FarolProjectile>(FindObjectsSortMode.None).Length>=3)return;
            lastThrow=Time.time;pendingThrow=Time.time+.333333f;Play(grounded?"bia.throw_stand":"bia.throw_air");
        }
        void SpawnShell()
        {
            var go=new GameObject("Concha arremessada");go.layer=2;go.transform.position=transform.position+new Vector3(facing*.5f,crouching?.5f:.8f,0);
            var sr=go.AddComponent<SpriteRenderer>();sr.sprite=projectileSprite;sr.sortingOrder=25;
            if(sr.sprite)go.transform.localScale=Vector3.one*(.35f/Mathf.Max(.01f,sr.sprite.bounds.size.x));
            var shot=go.AddComponent<FarolProjectile>();shot.direction=facing;shot.velocity=new Vector2(facing*9+body.linearVelocity.x*.3f,1.6f);
            var high=System.Linq.Enumerable.FirstOrDefault(FindObjectsByType<FarolEnemy>(FindObjectsSortMode.None),e=>e.monkey&&e.alive&&(e.transform.position.x-transform.position.x)*facing>.3f&&(e.transform.position.x-transform.position.x)*facing<7.4f&&e.transform.position.y>transform.position.y+.6f);
            if(high){float flight=Mathf.Clamp(Mathf.Abs(high.transform.position.x-go.transform.position.x)/7.8f,.22f,.75f);Vector2 target=(Vector2)high.transform.position+Vector2.up*.65f;shot.velocity=(target-(Vector2)go.transform.position)/flight+Vector2.up*(7*flight);}
        }
        public void MarkSlippery(){slipperyUntil=Time.time+.1f;}
        void CancelAction(){pendingThrow=-1;discovery=null;specialStarted=-1;if(island)island.CancelCharge();}
        public bool Discover(System.Action onDone){if(locked||externallyDriven||discovery!=null||Time.time<invulnerableUntil)return false;CancelAction();discovery=onDone;actionUntil=Time.time+.4f;horizontal=0;body.linearVelocity=Vector2.zero;Play("bia.discover");return true;}
        public void Lock(bool value){locked=value;if(value){CancelAction();Interrupted?.Invoke();horizontal=0;body.linearVelocity=Vector2.zero;}}
        public void BeginRopeControl(){supportBody=null;CancelAction();externallyDriven=true;body.gravityScale=0;body.linearVelocity=Vector2.zero;jumpBufferUntil=-10;crouching=false;SetHeight(standingHeight);Play("bia.jump");}
        public void EndRopeControl(Vector2 velocity){externallyDriven=false;body.gravityScale=18f/9.81f;body.linearVelocity=velocity;jumps=1;groundedAt=-10;grounded=false;jumpBufferUntil=-10;}
        public void Hurt(float fromX){if(Time.time<invulnerableUntil||locked)return;CancelAction();Interrupted?.Invoke();invulnerableUntil=Time.time+1.4f;body.linearVelocity=new Vector2(transform.position.x<fromX?-4.2f:4.2f,4.4f);}
        public void Respawn(){supportBody=null;CancelAction();Interrupted?.Invoke();body.position=respawnPosition;body.linearVelocity=Vector2.zero;invulnerableUntil=Time.time+1.4f;jumps=0;}
        public void Teleport(Vector2 position){respawnPosition=position;Respawn();}
    }
}
