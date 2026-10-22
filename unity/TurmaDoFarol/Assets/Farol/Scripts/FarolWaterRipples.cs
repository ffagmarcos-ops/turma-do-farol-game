using System.Collections.Generic;
using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolWaterRipples : MonoBehaviour
    {
        sealed class Ring {public LineRenderer line;public float born,power;public Vector2 point;}
        readonly List<Ring> rings=new List<Ring>();public Material material;public int emitted;
        public void Emit(Vector2 point,float power){var go=new GameObject("Ondulação de contato");go.transform.SetParent(transform,false);var line=go.AddComponent<LineRenderer>();line.sharedMaterial=material;line.loop=true;line.useWorldSpace=true;line.positionCount=32;line.startWidth=line.endWidth=.018f;line.sortingLayerName="Farol Agua";line.sortingOrder=5;rings.Add(new Ring{line=line,born=Time.time,point=point,power=Mathf.Clamp(power,.5f,2)});emitted++;}
        void Update(){for(int n=rings.Count-1;n>=0;n--){var r=rings[n];float t=Time.time-r.born;if(t>1.1f){Destroy(r.line.gameObject);rings.RemoveAt(n);continue;}float radius=(.12f+t*.9f)*r.power;for(int i=0;i<32;i++){float angle=i*Mathf.PI*2/32;r.line.SetPosition(i,new Vector3(r.point.x+Mathf.Cos(angle)*radius,r.point.y+Mathf.Sin(angle)*radius*.14f,0));}var c=new Color(.8f,1,1,(1-t/1.1f)*.65f);r.line.startColor=r.line.endColor=c;}}
    }
}
