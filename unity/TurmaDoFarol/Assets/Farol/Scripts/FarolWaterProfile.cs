using UnityEngine;
namespace TurmaDoFarol
{
    [CreateAssetMenu(menuName="Turma do Farol/Perfil visual de água")]
    public sealed class FarolWaterProfile : ScriptableObject
    {
        public Color shallow=new Color(.10f,.66f,.62f,.20f),deep=new Color(.015f,.20f,.31f,.65f);
        public float amplitude=.025f,speed=.65f,distortion=.0015f,density=1.5f,linearDrag=3,angularDrag=2.5f;
        public float Height(float x,float time)=>amplitude*(Mathf.Sin(x*.8f+time*speed)+.35f*Mathf.Sin(x*1.7f-time*speed*.7f));
    }
}
