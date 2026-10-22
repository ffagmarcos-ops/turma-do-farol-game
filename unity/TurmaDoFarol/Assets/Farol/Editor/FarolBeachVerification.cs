using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using UnityEditor;
using UnityEngine;
namespace TurmaDoFarol.Editor
{
    public static class FarolBeachVerification
    {
        static readonly List<string> log=new List<string>();
        static void Check(bool ok,string name){log.Add((ok?"PASS ":"FAIL ")+name);SessionState.SetString("PraiaResultados",string.Join("\n",log));}
        public static string Run(){if(!Application.isPlaying)throw new InvalidOperationException("Entre no Play.");log.Clear();SessionState.SetBool("PraiaTestando",true);UnityEngine.Object.FindFirstObjectByType<FarolIslandMechanics>().StartCoroutine(Verify());return "Verificação da praia iniciada";}
        static IEnumerator Verify()
        {
            int frame=Time.frameCount;yield return new WaitForSeconds(.4f);Check(Time.frameCount>frame,"Jogo avança em Play");
            var root=GameObject.Find("Praia — identidade HQ");var renderers=root.GetComponentsInChildren<MeshRenderer>();
            Check(renderers.Length>0&&renderers.All(r=>r.sharedMaterial&&r.sharedMaterial.mainTexture&&!ShaderUtil.ShaderHasError(r.sharedMaterial.shader)),"Terrenos com texturas e shaders válidos");
            Check(root.GetComponentsInChildren<Collider2D>().Length==0,"Acabamento não acrescenta colisores");
            var p=UnityEngine.Object.FindFirstObjectByType<FarolPlayerController>();foreach(var e in UnityEngine.Object.FindObjectsByType<FarolEnemy>(FindObjectsSortMode.None))foreach(var c in e.GetComponents<Collider2D>())Physics2D.IgnoreCollision(p.GetComponent<Collider2D>(),c,true);
            var grounds=UnityEngine.Object.FindObjectsByType<FarolSourceMarker>(FindObjectsSortMode.None).Where(m=>m.category=="ground"&&m.sector=="A").OrderBy(m=>m.transform.position.x).ToArray();
            foreach(var ground in grounds)
            {
                var bounds=ground.GetComponent<Collider2D>().bounds;var hit=Physics2D.Raycast(new Vector2(bounds.center.x,11),Vector2.down,14,1);
                p.Teleport(new Vector2(bounds.center.x,hit.point.y+.04f));yield return new WaitForSeconds(.45f);
                Check(p.grounded&&Mathf.Abs(p.transform.position.y-hit.point.y)<.09f,"Apoio original preservado em x="+bounds.center.x.ToString("F2"));
            }
            p.Teleport(new Vector2(8,1.84f));yield return new WaitForSeconds(.4f);float y=p.transform.position.y;
            typeof(FarolPlayerController).GetField("jumpBufferUntil",BindingFlags.NonPublic|BindingFlags.Instance).SetValue(p,Time.time+.15f);yield return new WaitForSeconds(.25f);Check(p.transform.position.y>y+.6f,"Pulo continua funcional");
            yield return new WaitForSeconds(1.2f);Check(p.grounded,"Personagem volta ao chão após o pulo");
            var layers=UnityEngine.Object.FindObjectsByType<FarolParallaxLayer>(FindObjectsSortMode.None).Where(l=>l.mirrorRepeat&&Mathf.Abs(l.x0)<.01f).ToArray();Check(layers.Length==4,"Quatro camadas novas ativas na praia");
            foreach(float x in new[]{12f,42f,68f})
            {
                var hit=Physics2D.Raycast(new Vector2(x,11),Vector2.down,14,1);p.Teleport(new Vector2(x,hit.point.y+.04f));yield return new WaitForSeconds(.65f);
                bool aligned=layers.All(l=>{var panels=l.panels.OrderBy(s=>s.transform.position.x).ToArray();return Enumerable.Range(1,panels.Length-1).All(i=>Mathf.Abs(panels[i].bounds.min.x-panels[i-1].bounds.max.x)<.005f&&panels[i].flipX!=panels[i-1].flipX);});
                Check(aligned,"Emendas de parallax alinhadas em x="+x);
            }
            Check(UnityEngine.Object.FindObjectsByType<SpriteRenderer>(FindObjectsSortMode.None).All(s=>s.sprite),"Sprites dos personagens, inimigos e cenário carregados");
            p.Teleport(new Vector2(5,1.84f));SessionState.SetBool("PraiaTestando",false);
        }
    }
}
