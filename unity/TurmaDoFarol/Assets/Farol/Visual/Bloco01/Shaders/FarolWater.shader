Shader "Farol/Visual/Agua2D"
{
 Properties {
  _Shallow("Margem",Color)=(0.10,0.66,0.62,0.20)
  _Deep("Profundidade",Color)=(0.015,0.20,0.31,0.65)
  _Amplitude("Onda",Float)=0.025
  _Speed("Velocidade",Float)=0.65
  _Distortion("Distorção",Float)=0.0015
  _Full("Qualidade completa",Float)=1
 }
 SubShader {
  Tags {"Queue"="Transparent" "RenderType"="Transparent" "RenderPipeline"="UniversalPipeline"}
  Blend SrcAlpha OneMinusSrcAlpha
  ZWrite Off Cull Off
  Pass {
   Tags {"LightMode"="Universal2D"}
   HLSLPROGRAM
   #pragma vertex vert
   #pragma fragment frag
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   TEXTURE2D(_CameraSortingLayerTexture);SAMPLER(sampler_CameraSortingLayerTexture);
   CBUFFER_START(UnityPerMaterial)
    half4 _Shallow,_Deep;float _Amplitude,_Speed,_Distortion,_Full;
   CBUFFER_END
   struct Attributes {float3 positionOS:POSITION;float2 uv:TEXCOORD0;};
   struct Varyings {float4 positionCS:SV_POSITION;float2 uv:TEXCOORD0;float2 world:TEXCOORD1;float4 screen:TEXCOORD2;};
   Varyings vert(Attributes v){Varyings o;float3 world=TransformObjectToWorld(v.positionOS);float t=_Time.y*_Speed;world.y+=step(.99,v.uv.y)*_Amplitude*(sin(world.x*.8+t)+.35*sin(world.x*1.7-t*.7));o.positionCS=TransformWorldToHClip(world);o.screen=ComputeScreenPos(o.positionCS);o.uv=v.uv;o.world=world.xy;return o;}
   half4 frag(Varyings i):SV_Target {
    float depth=saturate((1-i.uv.y)*1.2);half4 tint=lerp(_Shallow,_Deep,smoothstep(0,1,depth));float t=_Time.y*_Speed;
    float glint=pow(saturate(sin(i.world.x*6+t*1.8+sin(i.world.y*13+t))),22)*.10*(1-depth);
    float foam=smoothstep(.975,.997,i.uv.y)*(.3+.7*pow(saturate(sin(i.world.x*4.7-t*1.3)),4));
    half3 color=tint.rgb+glint+foam*.35;float alpha=saturate(tint.a+foam*.35);
    if(_Full>.5){float2 uv=i.screen.xy/i.screen.w;uv+=float2(sin(i.world.y*9+t*1.7),cos(i.world.x*3+t))*(1-depth)*_Distortion;half3 under=SAMPLE_TEXTURE2D(_CameraSortingLayerTexture,sampler_CameraSortingLayerTexture,uv).rgb;color=lerp(under,color,alpha);alpha=1;}
    return half4(color,alpha);
   }
   ENDHLSL
  }
 }
}
