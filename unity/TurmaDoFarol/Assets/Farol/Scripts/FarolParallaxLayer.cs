using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolParallaxLayer : MonoBehaviour
    {
        public Transform cameraTransform,player;public SpriteRenderer[] panels;public float factor,width,x0,x1;public float verticalCenter=5.4f;public bool mirrorRepeat;
        void LateUpdate()
        {
            if(!cameraTransform||width<=0)return;
            bool visible=!player||(player.position.x>=x0&&player.position.x<x1);
            float cam=cameraTransform.position.x;int tile=Mathf.FloorToInt(cam*factor/width);
            for(int i=0;i<panels.Length;i++){panels[i].enabled=visible;if(mirrorRepeat)panels[i].flipX=((tile+i-panels.Length/2)&1)!=0;panels[i].transform.position=new Vector3(cam*(1-factor)+(tile+i-panels.Length/2)*width,verticalCenter,0);}
        }
    }
}
