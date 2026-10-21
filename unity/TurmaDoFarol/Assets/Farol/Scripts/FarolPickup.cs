using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolPickup : MonoBehaviour
    {
        public string id;public int value=1;Vector3 origin;
        void Start(){origin=transform.position;if(FarolGameSession.Instance&&FarolGameSession.Instance.Collected(id))gameObject.SetActive(false);}
        void Update(){transform.position=origin+Vector3.up*Mathf.Sin(Time.time*2+origin.x)*.07f;}
        void OnTriggerEnter2D(Collider2D c){if(!c.GetComponent<FarolPlayerController>())return;if(FarolGameSession.Instance)FarolGameSession.Instance.Collect(id,value);gameObject.SetActive(false);}
    }
}
