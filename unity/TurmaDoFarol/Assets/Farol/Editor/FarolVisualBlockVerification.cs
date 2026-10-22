using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering.Universal;
namespace TurmaDoFarol.Editor
{
    public static class FarolVisualBlockVerification
    {
        static readonly List<string> log=new List<string>();
        static void Check(bool ok,string name){log.Add((ok?"PASS ":"FAIL ")+name);SessionState.SetString("VisualBlockResults",string.Join("\n",log));}
        public static string Run(){var preview=UnityEngine.Object.FindFirstObjectByType<FarolVisualPreview>();if(!Application.isPlaying||!preview)throw new InvalidOperationException("Abra a referência e entre no Play.");log.Clear();SessionState.SetBool("VisualBlockTesting",true);preview.StartCoroutine(Verify(preview));return "Verificação da água e da travessia iniciada";}
        static IEnumerator Verify(FarolVisualPreview p)
        {
            int frame=Time.frameCount;yield return new WaitForSeconds(4);
            var body=GameObject.Find("Caixa flutuante de referência").GetComponent<Rigidbody2D>();var water=p.water;
            float immersion=(water.transform.position.y-(body.position.y-.45f))/.9f;
            Check(Time.frameCount>frame,"Jogo avança durante a referência");
            Check(UnityEngine.Rendering.GraphicsSettings.currentRenderPipeline is UniversalRenderPipelineAsset,"Renderização URP ativa na referência");
            Check(!ShaderUtil.ShaderHasError(water.GetComponent<Renderer>().sharedMaterial.shader),"Shader de água sem erros");
            Check(immersion>.3f&&immersion<.6f,"Linha de imersão coerente da caixa");
            Check(water.contacts>0&&water.GetComponent<FarolWaterRipples>().emitted>0,"Contato real produz ondulações");
            Check(water.buoyancy.colliderMask==(1<<10),"Empuxo restrito aos objetos flutuantes");
            Check(water.gameObject.layer==2,"Água visual não vira piso para a personagem");
            Vector2 before=body.position;yield return new WaitForSeconds(2);
            Check(Vector2.Distance(before,body.position)<.06f&&body.linearVelocity.magnitude<.08f,"Flutuação estável após acomodação");
            Check(Mathf.Abs(body.rotation)<=8.1f,"Inclinação física limitada");
            p.SetQuality(false);yield return new WaitForSeconds(2);
            Check(!water.fullQuality&&QualitySettings.renderPipeline==p.lightPipeline,"Perfil leve ativo");
            Check(Mathf.Abs(before.y-body.position.y)<.06f,"Perfil leve preserva o empuxo");
            p.SetQuality(true);yield return new WaitForSeconds(1);
            Check(water.fullQuality&&QualitySettings.renderPipeline==p.fullPipeline,"Retorno ao perfil completo");
            var data=(QualitySettings.renderPipeline as UniversalRenderPipelineAsset).rendererDataList[0];var serialized=new SerializedObject(data);
            Check(serialized.FindProperty("m_UseCameraSortingLayersTexture").boolValue,"Captura 2D habilitada no perfil completo");
            Check(serialized.FindProperty("m_CameraSortingLayersTextureBound").intValue==SortingLayer.NameToID("Farol Submerso"),"Captura termina antes de atores e interface");
            var mechanics=UnityEngine.Object.FindFirstObjectByType<FarolIslandMechanics>();var helper=mechanics.helpers.First(h=>h.id=="lucasI0");
            Check(helper.finished&&helper.platforms.All(t=>t.GetComponent<Collider2D>().enabled),"Lucas ativa a travessia original");
            var player=UnityEngine.Object.FindFirstObjectByType<FarolPlayerController>();var platform=helper.platforms[0];player.Teleport(new Vector2(platform.position.x,platform.GetComponent<Collider2D>().bounds.max.y+.03f));yield return new WaitForSeconds(.7f);
            Check(player.grounded&&helper.sinks[0]>0,"Personagem continua apoiada na boia");
            player.Teleport(p.spawn);yield return new WaitForSeconds(.8f);
            Check(helper.sinks[0]<.01f,"Boia retorna após a saída da personagem");
            Check(UnityEngine.Object.FindObjectsByType<SpriteRenderer>(FindObjectsSortMode.None).All(s=>s.sprite),"Sprites permanecem carregados");
            SessionState.SetString("VisualBlockMeasures",$"Imersão: {immersion:P1}; posição: {body.position}; massa: {body.mass}; contatos: {water.contacts}; ondulações: {water.GetComponent<FarolWaterRipples>().emitted}");
            SessionState.SetBool("VisualBlockTesting",false);
        }
    }
}
