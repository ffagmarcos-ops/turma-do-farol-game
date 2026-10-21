using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolPose : MonoBehaviour
    {
        public string animationName;
        void Start(){var a=GetComponent<Animator>();if(a&&!string.IsNullOrEmpty(animationName))a.Play(animationName);}
    }
}
