using UnityEngine;
namespace TurmaDoFarol
{
 [DefaultExecutionOrder(120)]
 public sealed class FarolClearingScenery:MonoBehaviour
 {
  public FarolParallaxLayer layer;
  void LateUpdate(){if(!layer||!layer.player)return;float x=layer.player.position.x;float openness=Mathf.InverseLerp(344.6f,346.6f,x)*(1-Mathf.InverseLerp(352.8f,355.2f,x));foreach(var p in layer.panels){var c=p.color;c.a*=Mathf.Lerp(1,.45f,openness);p.color=c;}}
 }
}
