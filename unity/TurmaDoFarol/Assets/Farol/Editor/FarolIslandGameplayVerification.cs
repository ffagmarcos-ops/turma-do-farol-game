using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using UnityEditor;
using UnityEngine;
namespace TurmaDoFarol.Editor
{
    // Teste de integração explícito sobre a cena em Play, usando uma partida de teste.
    public static class FarolIslandGameplayVerification
    {
        static readonly List<string> results=new List<string>();
        static void Check(bool ok,string label){results.Add((ok?"PASS ":"FAIL ")+label);SessionState.SetString("IslandAuditResults",string.Join("\n",results));}
        static void Move(FarolPlayerController p,float x,float fallback=1.85f){var hit=Physics2D.Raycast(new Vector2(x,11),Vector2.down,15,1);p.Teleport(new Vector2(x,hit.collider?hit.point.y+.04f:fallback));}
        public static string Run(){if(!Application.isPlaying)throw new InvalidOperationException("Entre no Play.");results.Clear();SessionState.SetBool("IslandAuditRunning",true);var m=UnityEngine.Object.FindFirstObjectByType<FarolIslandMechanics>();m.StartCoroutine(Verify(m));return "Revisão de integração iniciada";}
        static IEnumerator Verify(FarolIslandMechanics m)
        {
            var p=UnityEngine.Object.FindFirstObjectByType<FarolPlayerController>();var session=FarolGameSession.Instance;var level=JObject.Parse(m.map.text);int startFrame=Time.frameCount;
            yield return new WaitForSeconds(.2f);Check(Time.frameCount>startFrame,"Frames do jogo avançam");
            Check(UnityEngine.Object.FindObjectsByType<SpriteRenderer>(FindObjectsSortMode.None).All(s=>s.sprite),"Todos os SpriteRenderers possuem sprite");
            Check(m.helpers.Where(h=>h.npc).All(h=>h.npc.GetCurrentAnimatorStateInfo(0).shortNameHash!=Animator.StringToHash("bia_idle")),"NPCs mantêm seus próprios atlas");
            // Imuniza as travessias da inspeção sem modificar a lógica dos inimigos.
            foreach(var e in UnityEngine.Object.FindObjectsByType<FarolEnemy>(FindObjectsSortMode.None))foreach(var c in e.GetComponents<Collider2D>())Physics2D.IgnoreCollision(p.GetComponent<Collider2D>(),c,true);
            foreach(var sector in level["sectors"]){float x=(float)sector["x0"]/100+1.2f;Move(p,x);yield return new WaitForSeconds(.2f);Check(float.IsFinite(p.transform.position.y)&&p.GetComponent<SpriteRenderer>().sprite,"Setor "+sector["id"]+": cena e protagonista carregados");}
            foreach(var h in m.helpers){int oldFlash=m.flashCount;Move(p,h.zone.xMin+.35f);yield return new WaitForSeconds(h.kind=="helpZoneMarina"?4:h.kind=="helpZoneJulia"?4:3.4f);
                if(h.kind=="helpZoneJulia"){Check(m.flashCount>oldFlash,"Flash da Júlia "+h.id);continue;}
                Check(h.finished,"Ajuda concluída "+h.id);
                if(h.crate)Check(Vector2.Distance((Vector2)h.crate.position-Vector2.up*.64f,h.target)<.04f,"Caixa posicionada "+h.id);
                if(h.platforms!=null)Check(h.platforms.All(t=>t.GetComponent<Collider2D>().enabled&&t.GetComponent<Renderer>().enabled),"Plataformas visíveis e sólidas "+h.id);
            }
            var surface=UnityEngine.Object.FindObjectsByType<FarolIslandSurface>(FindObjectsSortMode.None).First(s=>s.crumble);var bounds=surface.GetComponent<Collider2D>().bounds;p.Teleport(new Vector2(bounds.center.x,bounds.max.y+.04f));yield return new WaitForSeconds(.95f);Check(surface.broken&&!surface.GetComponent<Collider2D>().enabled,"Plataforma instável quebra ao pisar");Move(p,1.5f);yield return new WaitForSeconds(2.8f);Check(!surface.broken&&surface.GetComponent<Collider2D>().enabled,"Plataforma instável reaparece");
            var moving=UnityEngine.Object.FindObjectsByType<FarolMovingPlatform>(FindObjectsSortMode.None).First(x=>x.enabled&&Mathf.Abs(x.amplitude.x)>.5f);var mb=moving.GetComponent<Collider2D>().bounds;p.Teleport(new Vector2(mb.center.x,mb.max.y+.04f));yield return new WaitForSeconds(.4f);float relative=p.transform.position.x-moving.transform.position.x;yield return new WaitForSeconds(.8f);Check(p.grounded&&Mathf.Abs(p.transform.position.x-moving.transform.position.x-relative)<.35f,"Plataforma móvel carrega a personagem");
            var monkey=UnityEngine.Object.FindObjectsByType<FarolEnemy>(FindObjectsSortMode.None).First(e=>e.monkey&&e.GetComponent<FarolSourceMarker>().sector=="C");int previous=monkey.stonesThrown;Move(p,monkey.transform.position.x+2);yield return new WaitForSeconds(4);Check(monkey.stonesThrown>previous,"Macaco mira e arremessa pedra");monkey.Stun(2.2f);Check(monkey.stunned,"Macaco atordoa e cancela ataque");
            var crab=UnityEngine.Object.FindObjectsByType<FarolEnemy>(FindObjectsSortMode.None).Where(e=>!e.monkey&&e.GetComponent<FarolSourceMarker>().sector=="A").OrderBy(e=>e.minX).First();crab.GetComponent<Rigidbody2D>().constraints=RigidbodyConstraints2D.FreezeRotation|RigidbodyConstraints2D.FreezePositionX;Move(p,crab.transform.position.x-3.5f);yield return new WaitForSeconds(.6f);p.ThrowShell();yield return new WaitForSeconds(1);Check(crab.health==1&&crab.alive,"Primeira concha acerta o caranguejo e retira uma vida");p.ThrowShell();yield return new WaitForSeconds(1);Check(!crab||!crab.alive,"Segunda concha derrota o caranguejo");
            var wall=UnityEngine.Object.FindObjectsByType<FarolBreakable>(FindObjectsSortMode.None).First();p.Teleport((Vector2)wall.transform.position+Vector2.left*2);yield return new WaitForSeconds(.2f);m.Recharge();Check(m.FireBark(),"Latido dispara");Check(!m.FireBark(),"Recarga impede latidos duplicados");Check(!wall.gameObject.activeSelf&&session.EventSeen("wall:"+wall.id),"Latido quebra parede e salva abertura");
            var orb=UnityEngine.Object.FindObjectsByType<FarolIslandCollectible>(FindObjectsSortMode.None).First(c=>!c.relic);orb.Collect();Check(m.CanBark,"Orbe recarrega o latido");var relic=UnityEngine.Object.FindObjectsByType<FarolIslandCollectible>(FindObjectsSortMode.None).First(c=>c.relic);relic.Collect();Check(session.EventSeen("relic:"+relic.id),"Relíquia coletada e salva");
            var rope=UnityEngine.Object.FindFirstObjectByType<FarolIslandRopes>();var ready=rope.ropes.First(r=>r.deployed&&r.helperId==null);p.Teleport(new Vector2(ready.anchor.x,ready.anchor.y-1.8f));yield return new WaitForSeconds(.05f);Check(rope.TryGrab(ready)||rope.attached==ready,"Agarrar corda");rope.Release(1);Check(!p.externallyDriven&&p.GetComponent<Rigidbody2D>().gravityScale>0,"Soltar corda restaura física");
            session.Checkpoint(new Vector2(1.5f,1.84f));p.GetComponent<Rigidbody2D>().position=new Vector2(2,-5);p.Respawn();Check(Vector2.Distance(p.GetComponent<Rigidbody2D>().position,new Vector2(1.5f,1.84f))<.05f,"Respawn retorna ao checkpoint sem game over");
            p.Teleport(new Vector2(1070.8f,1.84f));yield return new WaitForSeconds(1);Check(m.completed&&session.EventSeen("fase3-concluida"),"Encerramento na Caverna Azul e conclusão salva");
            Check(UnityEngine.Object.FindObjectsByType<SpriteRenderer>(FindObjectsSortMode.None).All(s=>s.sprite),"Nenhum sprite ausente após ativar as mecânicas");SessionState.SetBool("IslandAuditRunning",false);
        }
    }
}
