using UnityEngine;
namespace TurmaDoFarol
{
    // Grupos em coordenadas de parallax: passam pela tela em vez de acompanhar suas bordas.
    [DefaultExecutionOrder(100)]
    public sealed class FarolBeachForeground : MonoBehaviour
    {
        public SpriteRenderer[] plants;public Sprite[] variations;public Camera lens;public Transform player;
        public float sectorStart,sectorEnd=76.8f,parallaxFactor=1.24f,spacing=7.2f;
        void LateUpdate()
        {
            if(!lens||plants==null||variations==null||variations.Length==0||spacing<=0)return;
            float x=player?player.position.x:lens.transform.position.x;
            float visibility=Mathf.Clamp01((sectorEnd-x)/2f)*Mathf.Clamp01((x-sectorStart+1)/2f);
            float cameraX=lens.transform.position.x,bottom=lens.transform.position.y-lens.orthographicSize;
            int center=Mathf.FloorToInt(cameraX*parallaxFactor/spacing);
            for(int i=0;i<plants.Length;i++)
            {
                var sr=plants[i];if(!sr)continue;int cell=center+i-plants.Length/2;
                int seed=Mathf.Abs(cell*37+11);var sprite=variations[seed%variations.Length];
                sr.enabled=visibility>0;if(!sprite)continue;sr.sprite=sprite;
                float width=5.8f+(seed%3)*.4f;sr.transform.localScale=Vector3.one*(width/sprite.bounds.size.x);
                float jitter=(seed%5-2)*.32f;
                sr.transform.position=new Vector3(cell*spacing+jitter+cameraX*(1-parallaxFactor),bottom+1.05f+(seed%2)*.12f,0);
                sr.flipX=(cell&1)!=0;var color=sr.color;color.a=.88f*visibility;sr.color=color;
            }
        }
    }
}
