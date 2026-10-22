using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolIslandSurface : MonoBehaviour
    {
        public bool crumble,slippery;public Animator animator;public string id;public bool broken {get;private set;}
        Collider2D surface;SpriteRenderer[] renderers;float timer=-1,restoreAt;Vector3 origin;
        void Awake(){surface=GetComponent<Collider2D>();renderers=GetComponentsInChildren<SpriteRenderer>();origin=transform.position;}
        void OnCollisionStay2D(Collision2D c){var p=c.collider.GetComponent<FarolPlayerController>();if(!p||p.transform.position.y<surface.bounds.max.y-.2f)return;if(slippery)p.MarkSlippery();if(crumble&&timer<0&&!broken){timer=.65f;FarolIslandArt.Play(animator,"crumble.break");}}
        void Update(){if(!crumble||Time.timeScale==0)return;if(!broken&&timer>=0){timer-=Time.deltaTime;if(timer<=0){broken=true;restoreAt=Time.time+2.5f;surface.enabled=false;foreach(var sr in renderers)sr.enabled=false;}}else if(broken&&Time.time>=restoreAt){broken=false;timer=-1;transform.position=origin;surface.enabled=true;foreach(var sr in renderers)sr.enabled=true;FarolIslandArt.Play(animator,"crumble.idle");}}
    }
}
