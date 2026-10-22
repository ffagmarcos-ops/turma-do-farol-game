using UnityEngine;
namespace TurmaDoFarol
{
    // O empuxo pertence somente ao Effector2D. A oscilação adicional é apenas do desenho.
    public sealed class FarolFloatingVisual : MonoBehaviour
    {
        public FarolWaterProfile profile;public Transform visual;Rigidbody2D body;
        void Awake(){body=GetComponent<Rigidbody2D>();}
        void LateUpdate(){if(!visual||!profile)return;visual.localPosition=Vector3.up*profile.Height(transform.position.x,Time.time);visual.localRotation=Quaternion.Euler(0,0,Mathf.Sin(Time.time*.8f)*1.5f);if(body&&Mathf.Abs(body.rotation)>8){body.MoveRotation(Mathf.Clamp(body.rotation,-8,8));body.angularVelocity=0;}}
    }
}
