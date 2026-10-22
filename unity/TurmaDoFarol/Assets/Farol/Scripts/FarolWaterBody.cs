using UnityEngine;
namespace TurmaDoFarol
{
    [RequireComponent(typeof(MeshFilter),typeof(MeshRenderer))]
    public sealed class FarolWaterBody : MonoBehaviour
    {
        public FarolWaterProfile profile;public float width=10.8f,depth=3;public bool fullQuality=true;
        public BuoyancyEffector2D buoyancy;public int contacts;Mesh mesh;MaterialPropertyBlock properties;float nextRipple;
        void Awake(){Build();}
        public void Build()
        {
            const int segments=64;var vertices=new Vector3[(segments+1)*2];var uv=new Vector2[vertices.Length];var indices=new int[segments*6];
            for(int i=0;i<=segments;i++){float u=(float)i/segments;vertices[i*2]=new Vector3(u*width,-depth,0);vertices[i*2+1]=new Vector3(u*width,0,0);uv[i*2]=new Vector2(u,0);uv[i*2+1]=new Vector2(u,1);if(i==segments)continue;int n=i*6,v=i*2;indices[n]=v;indices[n+1]=v+1;indices[n+2]=v+2;indices[n+3]=v+1;indices[n+4]=v+3;indices[n+5]=v+2;}
            mesh=new Mesh{name="Superfície da água — malha de ondas"};mesh.hideFlags=Application.isPlaying?HideFlags.DontSave:HideFlags.None;mesh.vertices=vertices;mesh.uv=uv;mesh.triangles=indices;mesh.RecalculateBounds();var b=mesh.bounds;b.Expand(.15f);mesh.bounds=b;GetComponent<MeshFilter>().sharedMesh=mesh;ApplyProfile();
        }
        public void SetQuality(bool full){fullQuality=full;ApplyProfile();}
        void ApplyProfile(){if(!profile)return;properties=properties??new MaterialPropertyBlock();properties.SetColor("_Shallow",profile.shallow);properties.SetColor("_Deep",profile.deep);properties.SetFloat("_Amplitude",profile.amplitude);properties.SetFloat("_Speed",profile.speed);properties.SetFloat("_Distortion",profile.distortion);properties.SetFloat("_Full",fullQuality?1:0);GetComponent<MeshRenderer>().SetPropertyBlock(properties);if(buoyancy){buoyancy.density=profile.density;buoyancy.linearDamping=profile.linearDrag;buoyancy.angularDamping=profile.angularDrag;}}
        void OnTriggerEnter2D(Collider2D other){if(other.gameObject.layer!=10)return;contacts++;var fx=GetComponent<FarolWaterRipples>();if(fx)fx.Emit(new Vector2(other.bounds.center.x,transform.position.y),other.attachedRigidbody?other.attachedRigidbody.linearVelocity.magnitude:1);}
        void OnTriggerStay2D(Collider2D other){if(other.gameObject.layer!=10||Time.time<nextRipple)return;nextRipple=Time.time+(fullQuality?1.8f:3.6f);var fx=GetComponent<FarolWaterRipples>();if(fx)fx.Emit(new Vector2(other.bounds.center.x,transform.position.y),.5f);}
        void OnDestroy(){if(mesh&&(mesh.hideFlags&HideFlags.DontSave)!=0)Destroy(mesh);}
    }
}
