using UnityEngine;
namespace TurmaDoFarol
{
    [RequireComponent(typeof(Rigidbody2D))]
    public sealed class FarolMovingPlatform : MonoBehaviour
    {
        public Vector2 amplitude;public float speed=1.5f,phase;
        Rigidbody2D body;Vector2 origin;
        void Awake(){body=GetComponent<Rigidbody2D>();body.bodyType=RigidbodyType2D.Kinematic;origin=body.position;}
        void FixedUpdate(){body.MovePosition(origin+amplitude*Mathf.Sin(Time.time*speed+phase));}
    }
}
