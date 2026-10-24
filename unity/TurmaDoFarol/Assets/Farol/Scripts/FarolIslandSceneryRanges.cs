using UnityEngine;
namespace TurmaDoFarol
{
    // Aplica o ambiente após o paralaxe e o primeiro plano atualizarem suas posições.
    [DefaultExecutionOrder(105)]
    public sealed class FarolIslandSceneryRanges : MonoBehaviour
    {
        public FarolParallaxLayer forest;
        public FarolBeachForeground foreground;
        public Vector2 interior = new Vector2(768,806.4f), thinning = new Vector2(960,1036.8f);
        void LateUpdate()
        {
            if(forest&&forest.player){float alpha=Mathf.Lerp(1,.32f,Mathf.InverseLerp(thinning.x,thinning.y,forest.player.position.x));foreach(var sr in forest.panels){var color=sr.color;color.a*=alpha;sr.color=color;}}
            if(foreground&&foreground.player){float x=foreground.player.position.x;float hidden=Mathf.InverseLerp(interior.x-2,interior.x+2,x)*(1-Mathf.InverseLerp(interior.y-2,interior.y+2,x));foreach(var sr in foreground.plants){var color=sr.color;color.a*=1-hidden;sr.color=color;}}
        }
    }
}
