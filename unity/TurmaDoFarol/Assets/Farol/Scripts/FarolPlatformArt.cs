using UnityEngine;
namespace TurmaDoFarol
{
    // A nova laje usa o mesmo corpo; os quadros de quebra originais continuam visíveis durante a ação.
    [DefaultExecutionOrder(110)]
    public sealed class FarolPlatformArt : MonoBehaviour
    {
        public SpriteRenderer source,visual;public FarolIslandSurface surface;public Animator animator;
        void LateUpdate()
        {
            if(!source||!visual)return;
            bool breaking=surface&&surface.crumble&&animator&&animator.GetCurrentAnimatorStateInfo(0).shortNameHash==Animator.StringToHash("crumble_break");
            source.forceRenderingOff=!breaking;visual.enabled=source.enabled&&!breaking;visual.color=source.color;
        }
        void OnDisable(){if(source)source.forceRenderingOff=false;}
    }
}
