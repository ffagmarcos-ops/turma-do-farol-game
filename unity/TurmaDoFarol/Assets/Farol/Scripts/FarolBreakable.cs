using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolBreakable : MonoBehaviour
    {
        public string id;
        void Start(){if(FarolGameSession.Instance&&FarolGameSession.Instance.EventSeen("wall:"+id))gameObject.SetActive(false);}
        public void Break(){if(!gameObject.activeSelf)return;if(!string.IsNullOrEmpty(id)&&FarolGameSession.Instance)FarolGameSession.Instance.RememberEvent("wall:"+id);gameObject.SetActive(false);}
    }
}
