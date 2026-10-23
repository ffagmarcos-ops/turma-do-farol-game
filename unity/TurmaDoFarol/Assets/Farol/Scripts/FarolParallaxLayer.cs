using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolParallaxLayer : MonoBehaviour
    {
        public Transform cameraTransform,player;public SpriteRenderer[] panels;public float factor,width,x0,x1;public float verticalCenter=5.4f;public bool mirrorRepeat;public float fadeDistance;public bool fadeIn,fadeOut;Color[] baseColors;
        void LateUpdate()
        {
            if(!cameraTransform||width<=0)return;
            float position=player?player.position.x:cameraTransform.position.x;
            bool visible=position>=x0-(fadeIn?fadeDistance:0)&&position<x1+(fadeOut?fadeDistance:0);
            float alpha=1;if(fadeDistance>0){if(fadeIn)alpha*=Mathf.InverseLerp(x0-fadeDistance,x0+fadeDistance,position);if(fadeOut)alpha*=1-Mathf.InverseLerp(x1-fadeDistance,x1+fadeDistance,position);}
            if(baseColors==null||baseColors.Length!=panels.Length){baseColors=new Color[panels.Length];for(int i=0;i<panels.Length;i++)baseColors[i]=panels[i].color;}
            float cam=cameraTransform.position.x;int tile=Mathf.FloorToInt(cam*factor/width);
            for(int i=0;i<panels.Length;i++){panels[i].enabled=visible;if(fadeDistance>0){var color=baseColors[i];color.a*=alpha;panels[i].color=color;}if(mirrorRepeat)panels[i].flipX=((tile+i-panels.Length/2)&1)!=0;panels[i].transform.position=new Vector3(cam*(1-factor)+(tile+i-panels.Length/2)*width,verticalCenter,0);}
        }
    }
}
