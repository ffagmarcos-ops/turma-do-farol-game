using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolProjectile : MonoBehaviour
    {
        public int direction=1; public float speed=9; float age;
        void Update()
        {
            float distance=speed*Time.deltaTime;
            var hits=Physics2D.CircleCastAll(transform.position,.16f,Vector2.right*direction,distance);
            foreach(var hit in hits) {
                var enemy=hit.collider.GetComponent<FarolEnemy>();
                if(enemy){enemy.Defeat();Destroy(gameObject);return;}
                var wall=hit.collider.GetComponent<FarolBreakable>();
                if(wall){wall.Break();Destroy(gameObject);return;}
                if(!hit.collider.isTrigger&&hit.collider.gameObject.layer==0){Destroy(gameObject);return;}
            }
            transform.position+=Vector3.right*direction*distance;transform.Rotate(0,0,-direction*480*Time.deltaTime);
            age+=Time.deltaTime;if(age>2.5f)Destroy(gameObject);
        }
    }
}
