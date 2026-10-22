using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolCampaignShell:MonoBehaviour
    {
        public string id;public bool gold;Vector3 origin;
        void Start(){origin=transform.position;}
        void Update(){transform.position=origin+Vector3.up*Mathf.Sin(Time.time*2+origin.x)*.07f;}
    }
}
