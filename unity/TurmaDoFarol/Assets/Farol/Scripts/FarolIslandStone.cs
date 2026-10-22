using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolIslandStone : MonoBehaviour
    {
        public Vector2 velocity;float age;
        void Update(){if(Time.timeScale==0)return;float dt=Time.deltaTime;Vector2 step=velocity*dt;var hit=Physics2D.CircleCastAll(transform.position,.16f,step.normalized,step.magnitude);foreach(var h in hit){var p=h.collider.GetComponent<FarolPlayerController>();if(p){p.Hurt(transform.position.x);Destroy(gameObject);return;}if(h.collider.gameObject.layer==0&&!h.collider.isTrigger){Destroy(gameObject);return;}}transform.position+=(Vector3)step;velocity+=Vector2.down*18*dt;transform.Rotate(0,0,360*dt);age+=dt;if(age>4)Destroy(gameObject);}
    }
}
