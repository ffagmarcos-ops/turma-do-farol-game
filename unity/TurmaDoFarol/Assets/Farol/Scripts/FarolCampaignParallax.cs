using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolCampaignParallax:MonoBehaviour
    {
        public float factor=1;public float referenceX=9.6f;Vector3 origin;
        void Start(){origin=transform.position;}
        void LateUpdate(){var c=Camera.main;if(c)transform.position=origin+Vector3.right*(c.transform.position.x-referenceX)*(1-factor);}
    }
}
