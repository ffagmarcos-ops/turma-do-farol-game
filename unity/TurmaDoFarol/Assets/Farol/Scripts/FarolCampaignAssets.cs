using System;
using System.Collections.Generic;
using UnityEngine;
using Newtonsoft.Json.Linq;
namespace TurmaDoFarol
{
    [CreateAssetMenu(menuName="Turma do Farol/Campanha")]
    public sealed class FarolCampaignAssets : ScriptableObject
    {
        [Serializable] public class Art {public string key;public Sprite[] frames;public string[] names;public Texture2D texture;}
        [Serializable] public class Sound {public string key;public AudioClip clip;}
        public TextAsset data; public Art[] art;public Sound[] sounds;
        public UnityEngine.UIElements.VisualTreeAsset interfaceTree;
        public UnityEngine.UIElements.PanelSettings panel;
        JObject parsed; Dictionary<string,Art> lookup;
        public void InvalidateCache(){parsed=null;lookup=null;}
        public JObject Data=>parsed??(parsed=JObject.Parse(data.text));
        public Art Find(string key){if(lookup==null){lookup=new Dictionary<string,Art>();foreach(var a in art)lookup[a.key]=a;}return lookup.TryGetValue(key,out var v)?v:null;}
        public Sprite Sprite(string key,int frame=0){var a=Find(key);return a!=null&&a.frames.Length>0?a.frames[Mathf.Clamp(frame,0,a.frames.Length-1)]:null;}
        public Sprite Part(string key,string part){var a=Find(key);return a==null?null:Sprite(key,Mathf.Max(0,Array.IndexOf(a.names,part)));}
        public AudioClip Audio(string key){foreach(var s in sounds)if(s.key==key)return s.clip;return null;}
    }
}
