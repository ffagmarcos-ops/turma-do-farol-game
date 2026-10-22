using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolIslandCollectible : MonoBehaviour
    {
        public string id;public bool relic;public FarolIslandMechanics island;Vector3 origin;
        void Start(){origin=transform.position;if(relic&&FarolGameSession.Instance.EventSeen("relic:"+id))gameObject.SetActive(false);}
        void Update(){transform.position=origin+Vector3.up*Mathf.Sin(Time.time*2)*.1f;}
        void OnTriggerEnter2D(Collider2D c){if(!c.GetComponent<FarolPlayerController>())return;Collect();}
        public void Collect(){if(!gameObject.activeSelf)return;if(relic){FarolGameSession.Instance.RememberEvent("relic:"+id);island.Tell("Relíquia encontrada!");}else island.Recharge();gameObject.SetActive(false);}
    }
}
