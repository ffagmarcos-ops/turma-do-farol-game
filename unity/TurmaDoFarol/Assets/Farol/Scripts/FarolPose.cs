using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolPose : MonoBehaviour
    {
        public string animationName;
        void Start(){var a=GetComponent<Animator>();if(a&&!string.IsNullOrEmpty(animationName))a.Play(Animator.StringToHash("Base Layer."+animationName.Replace('.','_')),0,0);}
    }
}
