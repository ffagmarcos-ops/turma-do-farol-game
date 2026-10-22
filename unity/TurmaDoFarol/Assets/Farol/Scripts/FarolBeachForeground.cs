using UnityEngine;
namespace TurmaDoFarol
{
    // Folhas próximas nas bordas inferiores; área central livre para saltos e interações.
    [DefaultExecutionOrder(100)]
    public sealed class FarolBeachForeground : MonoBehaviour
    {
        public SpriteRenderer left,right;public Camera lens;public Transform player;
        public float sectorStart,sectorEnd=76.8f;
        void LateUpdate()
        {
            if(!lens||!left||!right)return;
            float x=player?player.position.x:lens.transform.position.x;
            float visibility=Mathf.Clamp01((sectorEnd-x)/2f)*Mathf.Clamp01((x-sectorStart+1)/2f);
            left.enabled=right.enabled=visibility>0;
            var lc=left.color;lc.a=.78f*visibility;left.color=lc;var rc=right.color;rc.a=.72f*visibility;right.color=rc;
            float half=lens.orthographicSize*lens.aspect,bottom=lens.transform.position.y-lens.orthographicSize;
            float drift=Mathf.Sin(lens.transform.position.x*.22f)*.4f;
            left.transform.position=new Vector3(lens.transform.position.x-half+.25f+drift,bottom+.6f,0);
            right.transform.position=new Vector3(lens.transform.position.x+half-.25f+drift*.65f,bottom+.55f,0);
        }
    }
}
