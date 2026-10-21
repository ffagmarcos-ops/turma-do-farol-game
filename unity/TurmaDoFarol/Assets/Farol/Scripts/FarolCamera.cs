using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolCamera : MonoBehaviour
    {
        public Transform target;public float levelWidth=1075.2f,followSpeed=7;Camera lens;
        void Awake(){lens=GetComponent<Camera>();}
        void LateUpdate(){if(!target)return;float half=lens.orthographicSize*lens.aspect;float x=Mathf.Clamp(target.position.x+2,half,Mathf.Max(half,levelWidth-half));transform.position=new Vector3(Mathf.Lerp(transform.position.x,x,1-Mathf.Exp(-followSpeed*Time.deltaTime)),5.4f,-10);}
    }
}
