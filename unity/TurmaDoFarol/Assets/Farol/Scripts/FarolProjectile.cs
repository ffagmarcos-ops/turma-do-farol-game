using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolProjectile : MonoBehaviour
    {
        public int direction=1;public float speed=9;public Vector2 velocity;float age;int bounces;
        void Start(){if(velocity==Vector2.zero)velocity=new Vector2(direction*speed,1.6f);}
        void Update()
        {
            if(Time.timeScale==0)return;
            Vector2 step=velocity*Time.deltaTime;var hits=Physics2D.CircleCastAll(transform.position,.16f,step.normalized,step.magnitude);
            foreach(var hit in hits){var enemy=hit.collider.GetComponent<FarolEnemy>();if(enemy&&enemy.alive){enemy.Hit(transform.position.x);Destroy(gameObject);return;}var wall=hit.collider.GetComponent<FarolBreakable>();if(wall){wall.Break();Destroy(gameObject);return;}if(!hit.collider.isTrigger&&hit.collider.gameObject.layer==0){if(++bounces>=2){Destroy(gameObject);return;}velocity=Vector2.Reflect(velocity,hit.normal)*.4f;transform.position=(Vector3)(hit.centroid+hit.normal*.02f);return;}}
            transform.position+=(Vector3)step;velocity+=Vector2.down*14*Time.deltaTime;transform.Rotate(0,0,-direction*480*Time.deltaTime);age+=Time.deltaTime;if(age>1.35f)Destroy(gameObject);
        }
    }
}
