using UnityEngine;
namespace TurmaDoFarol
{
 [DefaultExecutionOrder(115)]
 public sealed class FarolHangingPlatformArt:MonoBehaviour
 {
  public LineRenderer left,right;public Vector3 leftAnchor,rightAnchor;public Collider2D support;
  void LateUpdate(){if(!support)return;var b=support.bounds;if(left){left.SetPosition(0,leftAnchor);left.SetPosition(1,new Vector3(b.min.x+.22f,b.max.y,0));}if(right){right.SetPosition(0,rightAnchor);right.SetPosition(1,new Vector3(b.max.x-.22f,b.max.y,0));}}
 }
}
