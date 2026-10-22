Shader "Farol/Visual/VegetacaoProximaDesfocada"
{
 Properties {
  [PerRendererData] _MainTex("Vegetação",2D)="white"{}
  _Color("Cor",Color)=(1,1,1,1)
  _BlurPixels("Desfoque em pixels da arte",Range(0,30))=18
  [HideInInspector] _RendererColor("RendererColor",Color)=(1,1,1,1)
  [HideInInspector] _Flip("Flip",Vector)=(1,1,1,1)
  [PerRendererData] _AlphaTex("External Alpha",2D)="white"{}
  [PerRendererData] _EnableExternalAlpha("Enable External Alpha",Float)=0
 }
 SubShader {
  Tags {"Queue"="Transparent" "RenderType"="Transparent" "IgnoreProjector"="True" "CanUseSpriteAtlas"="True"}
  Cull Off ZWrite Off Lighting Off
  Blend One OneMinusSrcAlpha
  Pass {
   CGPROGRAM
   #pragma vertex vert
   #pragma fragment frag
   #pragma multi_compile_instancing
   #pragma multi_compile _ ETC1_EXTERNAL_ALPHA
   #include "UnitySprites.cginc"
   float4 _MainTex_TexelSize;float _BlurPixels;
   struct outputData{float4 position:SV_POSITION;float2 uv:TEXCOORD0;fixed4 color:COLOR;float4 screen:TEXCOORD1;};
   outputData vert(appdata_t input){v2f v=SpriteVert(input);outputData o;o.position=v.vertex;o.uv=v.texcoord;o.color=v.color;o.screen=ComputeScreenPos(v.vertex);return o;}
   fixed4 tap(float2 uv){fixed4 c=SampleSpriteTexture(uv);c.rgb*=c.a;return c;}
   fixed4 frag(outputData i):SV_Target{
    float2 d=_MainTex_TexelSize.xy*_BlurPixels;
    fixed4 c=tap(i.uv)*4;
    c+=(tap(i.uv+float2(d.x,0))+tap(i.uv-float2(d.x,0))+tap(i.uv+float2(0,d.y))+tap(i.uv-float2(0,d.y)))*2;
    c+=tap(i.uv+d)+tap(i.uv-d)+tap(i.uv+float2(d.x,-d.y))+tap(i.uv+float2(-d.x,d.y));c/=16;
    float2 screen=i.screen.xy/i.screen.w;
    float edge=smoothstep(.55,.9,abs(screen.x*2-1));float bottom=1-smoothstep(.22,.33,screen.y);
    c.rgb*=i.color.rgb*i.color.a;c.a*=i.color.a;return c*edge*bottom;
   }
   ENDCG
  }
 }
}
