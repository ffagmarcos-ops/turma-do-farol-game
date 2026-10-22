using System;
using System.Collections.Generic;
using UnityEngine;
namespace TurmaDoFarol
{
    // Catálogo serializado pelo Editor: nenhuma busca de arquivo é necessária durante o jogo.
    public sealed class FarolIslandArt : MonoBehaviour
    {
        public string[] keys;public Sprite[] sprites;public RuntimeAnimatorController controller;
        Dictionary<string,Sprite> lookup;
        public Sprite Find(string key){if(lookup==null){lookup=new Dictionary<string,Sprite>();for(int i=0;i<keys.Length;i++)lookup[keys[i]]=sprites[i];}return lookup.TryGetValue(key,out var s)?s:null;}
        public GameObject Visual(string name,string key,Vector2 position,float width=0,float height=0,int order=18,string pose=null,Transform parent=null)
        {
            var go=new GameObject(name);go.transform.SetParent(parent,false);go.transform.position=position;var sr=go.AddComponent<SpriteRenderer>();sr.sprite=Find(key);sr.sortingOrder=order;
            if(!sr.sprite)throw new InvalidOperationException("Arte da ilha ausente: "+key);
            if(width>0&&height>0)go.transform.localScale=new Vector3(width/sr.sprite.bounds.size.x,height/sr.sprite.bounds.size.y,1);
            if(pose!=null){go.AddComponent<Animator>().runtimeAnimatorController=controller;Play(go.GetComponent<Animator>(),pose);}return go;
        }
        public static void PlayIfChanged(Animator a,string pose){if(a&&a.GetCurrentAnimatorStateInfo(0).shortNameHash!=Animator.StringToHash(pose.Replace('.','_')))Play(a,pose);}
        public static void Play(Animator a,string pose){if(!a)return;int hash=Animator.StringToHash("Base Layer."+pose.Replace('.','_'));if(a.HasState(0,hash))a.Play(hash,0,0);}
    }
}
