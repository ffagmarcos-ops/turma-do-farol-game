using UnityEngine;
namespace TurmaDoFarol
{
    // Clareia somente a decoração que encobre a entrada, preservando o segredo e os apoios.
    public sealed class FarolSecretSceneryFade:MonoBehaviour
    {
        public SpriteRenderer visual;Transform player;
        void LateUpdate(){if(!visual)return;if(!player){var p=FindFirstObjectByType<FarolPlayerController>();if(p)player=p.transform;}bool discovered=FarolGameSession.Instance&&FarolGameSession.Instance.EventSeen("secret:raizes-floresta");float nearby=player?1-Mathf.InverseLerp(2.8f,5,Mathf.Abs(player.position.x-196.5f)):0;var c=visual.color;c.a=discovered?.15f:Mathf.Lerp(1,.2f,nearby);visual.color=c;}
    }
}
