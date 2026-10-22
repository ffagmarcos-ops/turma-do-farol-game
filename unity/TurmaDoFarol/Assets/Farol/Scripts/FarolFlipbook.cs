using UnityEngine;
using Newtonsoft.Json.Linq;
namespace TurmaDoFarol
{
    [RequireComponent(typeof(SpriteRenderer))]
    public sealed class FarolFlipbook : MonoBehaviour
    {
        public FarolCampaignAssets assets;public string character="marina",pose="idle";
        public string texture; public int[] frames;public float fps=8;public bool loop=true;
        float elapsed;string last; SpriteRenderer image;
        void Awake(){image=GetComponent<SpriteRenderer>();}
        public void Play(string next){if(pose==next&&last!=null)return;pose=next;last=null;elapsed=0;}
        public void Set(string key,int[] sequence,float rate=8,bool repeat=true){if(texture==key&&frames==sequence)return;texture=key;frames=sequence;fps=rate;loop=repeat;elapsed=0;last=pose;}
        void Update(){if(!image)image=GetComponent<SpriteRenderer>();if(!assets)return;
            if(last!=pose){last=pose;elapsed=0;var a=assets.Data["animations"] as JArray;foreach(var v in a)if((string)v["key"]==character+"."+pose){texture=(string)v["texture"];frames=v["frames"].ToObject<int[]>();fps=(float)v["fps"];loop=(bool)v["loop"];break;}}
            elapsed+=Time.deltaTime;if(frames==null||frames.Length==0)return;int n=Mathf.FloorToInt(elapsed*fps);image.sprite=assets.Sprite(texture,frames[loop?n%frames.Length:Mathf.Min(n,frames.Length-1)]);
        }
    }
}
