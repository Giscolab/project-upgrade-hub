import type { ShaderParams } from '@/types/shader';

export type LegacyNoise =
  | 'simplex' | 'voronoi' | 'fbm' | 'plasma' | 'galaxy' | 'marble'
  | 'acid' | 'cellular' | 'curl' | 'warp' | 'truchet' | 'ridged'
  | 'mandel' | 'wave' | 'hex' | 'react';

export interface LegacyPreset {
  noiseType: LegacyNoise;
  geometryType: ShaderParams['geometry'];
  uColorA: { r: number; g: number; b: number };
  uColorB: { r: number; g: number; b: number };
  uColorC: { r: number; g: number; b: number };
  uColorD: { r: number; g: number; b: number };
  uScale: number;
  uSpeed: number;
  uDisplacementStrength: number;
  uTwist: number;
  uPulse: number;
  uMorphFactor: number;
  uMetalness: number;
  uLightIntensity: number;
  uContrast: number;
  uSaturation: number;
  uGamma: number;
  uRimPower: number;
  uRimColor: { r: number; g: number; b: number };
  uFresnelStrength: number;
  uGlowRadius: number;
  bloomStrength?: number;
  glitchMode?: boolean;
  wireframe?: boolean;
}

export const vertexShaderMain = `
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
uniform mat4 worldViewProjection;
uniform mat4 world;
uniform mat4 worldView;
uniform float uTime;
uniform float uSpeed;
uniform float uScale;
uniform float uDisplacementStrength;
uniform float uTwist;
uniform float uPulse;
uniform float uMorphFactor;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uOverall;
uniform float uBassDisplace;
uniform float uMidDisplace;
uniform float uHighDisplace;
varying vec2 vUv;
varying vec2 vMatcapUV;
varying vec3 vViewNormal;
varying vec3 vWorldPos;
varying float vBass;
varying float vMid;
varying float vHigh;
varying float vNoise;
void main() {
  vUv = uv;
  vBass = uBass;
  vMid = uMid;
  vHigh = uHigh;
  vec3 viewNormal = normalize((worldView * vec4(normal, 0.0)).xyz);
  vViewNormal = viewNormal;
  vMatcapUV = viewNormal.xy * 0.5 + 0.5;
  float dynScale = uScale * (1.0 + uHigh * uHighDisplace * 0.5);
  vec2 st = vUv * dynScale;
  float dynSpeed = uSpeed * (1.0 + uMid * uMidDisplace);
  float n = getNoise(st + uTime * dynSpeed);
  vNoise = n;
  float dynDisplace = uDisplacementStrength * (1.0 + uBass * uBassDisplace * 3.0);
  float pulse = 1.0 + sin(uTime * uPulse) * 0.12;
  float angle = position.y * uTwist + uTime * 0.3;
  float c = cos(angle);
  float s = sin(angle);
  mat2 twMat = mat2(c, -s, s, c);
  vec3 twisted = position;
  twisted.xz = twMat * twisted.xz;
  vec3 spherePos = normalize(position);
  vec3 morphPos = mix(twisted, spherePos, uMorphFactor * uBass * 0.5);
  vec3 newPos = morphPos + normal * n * dynDisplace * pulse;
  vWorldPos = (world * vec4(newPos, 1.0)).xyz;
  gl_Position = worldViewProjection * vec4(newPos, 1.0);
}
`;

export const fragmentShaderMain = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;
uniform float uScale;
uniform float uSpeed;
uniform sampler2D uTexture;
uniform float uTextureMix;
uniform sampler2D uLayer1;
uniform sampler2D uLayer2;
uniform float uLayerBlend1;
uniform float uLayerBlend2;
uniform float uLayerOpacity1;
uniform float uLayerOpacity2;
uniform vec2 uMouse;
uniform sampler2D uMatcap;
uniform float uMetalness;
uniform float uLightIntensity;
uniform float uContrast;
uniform float uSaturation;
uniform float uGamma;
uniform float uRimPower;
uniform vec3 uRimColor;
uniform float uFresnelStrength;
uniform float uGlowRadius;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uOverall;
uniform float uBassDisplace;
uniform float uMidDisplace;
uniform float uHighDisplace;
varying vec2 vUv;
varying vec2 vMatcapUV;
varying vec3 vViewNormal;
varying vec3 vWorldPos;
varying float vBass;
varying float vMid;
varying float vHigh;
varying float vNoise;
vec3 sat(vec3 c,float s){float l=dot(c,vec3(.299,.587,.114));return mix(vec3(l),c,s);} 
vec3 blendLayer(vec3 base, vec3 layer, float mode, float opacity) {
  vec3 blended = layer;
  if (mode < 0.5) blended = base + layer;
  else if (mode < 1.5) blended = base * layer;
  else blended = mix(2.0 * base * layer, 1.0 - 2.0 * (1.0 - base) * (1.0 - layer), step(0.5, base));
  return mix(base, clamp(blended, 0.0, 1.0), clamp(opacity, 0.0, 1.0));
}
float fresnel(vec3 n,float p){ return pow(1.-abs(n.z), p); }
void main(){
  float dynScale = uScale*(1.+vHigh*uHighDisplace*.3);
  float dynSpeed = uSpeed*(1.+vMid*uMidDisplace);
  vec2 st = vUv*dynScale;
  float audioTime = uTime*dynSpeed + vBass*uBassDisplace*.5;
  float dist=distance(vUv,uMouse);
  float me=smoothstep(.5,0.,dist);
  float n = getNoise(st+audioTime+me*.3);
  float p = getNoise(st+n+audioTime*.2);
  float p2= getNoise(st*1.5-n*.5+audioTime*.1);
  vec3 color=mix(uColorA,uColorB,smoothstep(-.5,.2,p));
  color=mix(color,uColorC,smoothstep(.1,.6,p));
  color=mix(color,uColorD,smoothstep(.5,1.,p2));
  color+=uColorC*me*uGlowRadius*.8;
  color+=uColorA*vBass*uBassDisplace*.4;
  color*=(1.+vMid*uMidDisplace*.5);
  float shimmer=getNoise(st*4.+uTime*3.)*vHigh*uHighDisplace;
  color+=vec3(shimmer*.25);
  vec4 tex=texture2D(uTexture,vUv+n*.05);
  color=mix(color,tex.rgb,uTextureMix);
  vec3 l1 = texture2D(uLayer1, vUv).rgb;
  vec3 l2 = texture2D(uLayer2, vUv).rgb;
  color = blendLayer(color, l1, uLayerBlend1, uLayerOpacity1);
  color = blendLayer(color, l2, uLayerBlend2, uLayerOpacity2);
  vec3 mc=texture2D(uMatcap,vMatcapUV).rgb;
  color=mix(color,mc,uMetalness);
  vec3 nm=normalize(vViewNormal);
  float key=max(dot(nm,normalize(vec3(1.,1.2,-2.))),0.);
  float fill=max(dot(nm,normalize(vec3(-1.,0.,-1.5))),0.)*.35;
  float back=max(dot(nm,normalize(vec3(0.,-1.,1.))),0.)*.15;
  float dynL=uLightIntensity*(1.+vBass*uBassDisplace*.6);
  vec3 lighting=vec3(.15)+(vec3(1.)*key+vec3(.7)*fill+vec3(.4)*back)*dynL;
  color*=lighting;
  float rim=fresnel(nm,uRimPower);
  color+=uRimColor*rim*(1.+vHigh*.5);
  color+=uRimColor*fresnel(nm,uFresnelStrength)*.3;
  color=(color-.5)*uContrast+.5;
  color=sat(color,uSaturation);
  color=pow(max(color,0.),vec3(1./uGamma));
  gl_FragColor=vec4(color,1.);
}
`;

export const LEGACY_SHADER_CHUNKS: Record<LegacyNoise, string> = {
  simplex: `vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);} float snoise(vec2 v){const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.0);vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m;m=m*m;vec3 x2=2.*fract(p*C.www)-1.;vec3 h=abs(x2)-0.5;vec3 ox=floor(x2+0.5);vec3 a0=x2-ox;m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.*dot(m,g);} float getNoise(vec2 st){return snoise(st);}`,
  voronoi: `vec2 rnd2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);} float getNoise(vec2 st){vec2 i=floor(st),f=fract(st);float m=1.;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 nb=vec2(float(x),float(y));vec2 pt=rnd2(i+nb);pt=0.5+0.5*sin(6.2831*pt);m=min(m,length(nb+pt-f));}return m;}`,
  fbm: `float _r(vec2 s){return fract(sin(dot(s,vec2(12.9898,78.233)))*43758.5453);} float _n(vec2 s){vec2 i=floor(s),f=fract(s);float a=_r(i),b=_r(i+vec2(1,0)),c=_r(i+vec2(0,1)),d=_r(i+vec2(1,1));vec2 u=f*f*(3.-2.*f);return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;} float getNoise(vec2 st){float v=0.,a=0.5;mat2 r=mat2(.8,.6,-.6,.8);for(int i=0;i<6;i++){v+=a*_n(st);st=r*st*2.+100.;a*=.5;}return v;}`,
  plasma: `float getNoise(vec2 st){float v=sin(st.x*3.)+sin(st.y*3.)+sin((st.x+st.y)*3.)+sin(sqrt(st.x*st.x+st.y*st.y)*6.);return v*.25;}`,
  galaxy: `float getNoise(vec2 st){vec2 c=st-.5;float r=length(c),a=atan(c.y,c.x);float swirl=sin(r*8.-a*3.);float arms=sin(a*5.+r*4.)*exp(-r*2.);return (swirl*.5+arms)*.5+.5;}`,
  marble: `float _r(vec2 s){return fract(sin(dot(s,vec2(12.9898,78.233)))*43758.5453);} float _n(vec2 s){vec2 i=floor(s),f=fract(s);float a=_r(i),b=_r(i+vec2(1,0)),c=_r(i+vec2(0,1)),d=_r(i+vec2(1,1));vec2 u=f*f*(3.-2.*f);return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;} float fbmM(vec2 s){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*_n(s);s*=2.01;a*=.5;}return v;} float getNoise(vec2 st){float n=fbmM(st);return sin(st.x*4.+n*6.)*.5+.5;}`,
  acid: `float getNoise(vec2 st){float v=sin(st.x*5.+st.y*3.)+sin(st.x*3.-st.y*7.)*.7+sin((st.x+st.y)*4.)*.5+sin(sqrt(st.x*st.x+st.y*st.y)*8.)*.4+sin(st.x*9.)*sin(st.y*7.)*.3;return v*.2;}`,
  cellular: `vec2 rnd2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);} float getNoise(vec2 st){vec2 i=floor(st),f=fract(st);float m1=1.,m2=1.;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 nb=vec2(float(x),float(y));vec2 pt=rnd2(i+nb);float d=length(nb+pt-f);if(d<m1){m2=m1;m1=d;}else if(d<m2){m2=d;}}return m2-m1;}`,
  curl: `float _r(vec2 s){return fract(sin(dot(s,vec2(12.9898,78.233)))*43758.5453);} float _n(vec2 s){vec2 i=floor(s),f=fract(s);float a=_r(i),b=_r(i+vec2(1,0)),c=_r(i+vec2(0,1)),d=_r(i+vec2(1,1));vec2 u=f*f*(3.-2.*f);return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;} float getNoise(vec2 st){float eps=0.01;float n=_n(st);float nx=_n(st+vec2(eps,0.));float ny=_n(st+vec2(0.,eps));vec2 c=vec2(ny-n,-(nx-n))/eps;return _n(st+c*0.3);}`,
  warp: `float _r(vec2 s){return fract(sin(dot(s,vec2(12.9898,78.233)))*43758.5453);} float _n(vec2 s){vec2 i=floor(s),f=fract(s);float a=_r(i),b=_r(i+vec2(1,0)),c=_r(i+vec2(0,1)),d=_r(i+vec2(1,1));vec2 u=f*f*(3.-2.*f);return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;} float fbmW(vec2 s){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*_n(s);s*=2.;a*=.5;}return v;} float getNoise(vec2 st){vec2 q=vec2(fbmW(st),fbmW(st+vec2(1.7,9.2)));vec2 r=vec2(fbmW(st+4.*q+vec2(1.7,9.2)),fbmW(st+4.*q+vec2(8.3,2.8)));return fbmW(st+4.*r);}`,
  truchet: `float _r(vec2 s){return fract(sin(dot(s,vec2(127.1,311.7)))*43758.5453);} float getNoise(vec2 st){vec2 i=floor(st),f=fract(st);float r=step(0.5,_r(i));float d1=length(f-vec2(0.,0.));float d2=length(f-vec2(1.,1.));float d3=length(f-vec2(1.,0.));float d4=length(f-vec2(0.,1.));float arc1=min(abs(d1-.5),abs(d2-.5));float arc2=min(abs(d3-.5),abs(d4-.5));return mix(arc1,arc2,r)*2.;}`,
  ridged: `float _r(vec2 s){return fract(sin(dot(s,vec2(12.9898,78.233)))*43758.5453);} float _n(vec2 s){vec2 i=floor(s),f=fract(s);float a=_r(i),b=_r(i+vec2(1,0)),c=_r(i+vec2(0,1)),d=_r(i+vec2(1,1));vec2 u=f*f*(3.-2.*f);return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;} float getNoise(vec2 st){float v=0.,a=.5,freq=1.;for(int i=0;i<6;i++){float n=1.-abs(_n(st*freq)-.5)*2.;v+=a*n*n;freq*=2.;a*=.5;}return v;}`,
  mandel: `float getNoise(vec2 st){vec2 c=(st-.5)*2.5;vec2 z=vec2(0.);int iter=0;for(int i=0;i<32;i++){if(dot(z,z)>4.) break;z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+c;iter++;}return float(iter)/32.;}`,
  wave: `float getNoise(vec2 st){float v=0.;for(int i=0;i<5;i++){float fi=float(i);vec2 center=vec2(cos(fi*1.2+.5)*.5+.5,sin(fi*.9+1.3)*.5+.5);float d=length(st-center);v+=sin(d*20.-fi*1.5)/(d*8.+1.);}return v*.3;}`,
  hex: `vec2 hexRound(vec2 p){vec2 q=vec2(p.x*1.1547,p.y+p.x*.5774);vec2 qi=floor(q);vec2 qf=fract(q);float s=(qf.x+qf.y<1.)?0.:1.;return qi+s;} float _r(vec2 s){return fract(sin(dot(s,vec2(127.1,311.7)))*43758.5453);} float getNoise(vec2 st){st*=2.;vec2 hc=hexRound(st);vec2 center=vec2(hc.x*.8660,hc.y-.5*hc.x*.5774);float d=length(st-center);float border=smoothstep(.4,.45,d);return border+_r(hc)*.3;}`,
  react: `float getNoise(vec2 st){vec2 p = st * 3.0;for(int i=0; i<5; i++){p.x += sin(p.y + uTime * 0.5);p.y += cos(p.x + uTime * 0.5);}return sin(length(p)) * 0.5 + 0.5;}`,
};

export const LEGACY_PRESETS: Record<string, LegacyPreset> = {
  'Cyberpunk Neon': { noiseType: 'simplex', geometryType: 'sphere', uColorA: { r: 5, g: 0, b: 20 }, uColorB: { r: 180, g: 0, b: 255 }, uColorC: { r: 0, g: 255, b: 200 }, uColorD: { r: 255, g: 50, b: 100 }, uScale: 2.5, uSpeed: 0.8, uDisplacementStrength: 0.4, uTwist: 0.5, uPulse: 3, uMorphFactor: 0.2, uMetalness: 0.3, uLightIntensity: 1.4, uContrast: 1.3, uSaturation: 1.8, uGamma: 1.2, uRimPower: 3, uRimColor: { r: 0, g: 255, b: 200 }, uFresnelStrength: 4, uGlowRadius: 1, bloomStrength: 2 },
  'Lava Planet': { noiseType: 'fbm', geometryType: 'icosahedron', uColorA: { r: 5, g: 0, b: 0 }, uColorB: { r: 180, g: 20, b: 0 }, uColorC: { r: 255, g: 100, b: 0 }, uColorD: { r: 255, g: 220, b: 50 }, uScale: 3, uSpeed: 0.3, uDisplacementStrength: 0.7, uTwist: 0, uPulse: 1.5, uMorphFactor: 0, uMetalness: 0, uLightIntensity: 1.8, uContrast: 1.5, uSaturation: 1.6, uGamma: 1, uRimPower: 2, uRimColor: { r: 255, g: 80, b: 0 }, uFresnelStrength: 3, uGlowRadius: 0.5, bloomStrength: 1.5 },
  'Deep Ocean': { noiseType: 'voronoi', geometryType: 'sphere', uColorA: { r: 0, g: 5, b: 30 }, uColorB: { r: 0, g: 40, b: 100 }, uColorC: { r: 0, g: 150, b: 180 }, uColorD: { r: 150, g: 230, b: 255 }, uScale: 2, uSpeed: 0.4, uDisplacementStrength: 0.3, uTwist: 0.2, uPulse: 2, uMorphFactor: 0.1, uMetalness: 0.5, uLightIntensity: 1.2, uContrast: 1.1, uSaturation: 1.4, uGamma: 1.1, uRimPower: 4, uRimColor: { r: 100, g: 200, b: 255 }, uFresnelStrength: 5, uGlowRadius: 0.8, bloomStrength: 1.2 },
  'Acid Trip': { noiseType: 'acid', geometryType: 'torusknot', uColorA: { r: 0, g: 255, b: 50 }, uColorB: { r: 255, g: 0, b: 150 }, uColorC: { r: 255, g: 255, b: 0 }, uColorD: { r: 0, g: 150, b: 255 }, uScale: 2, uSpeed: 1.2, uDisplacementStrength: 0.5, uTwist: 2, uPulse: 5, uMorphFactor: 0.3, uMetalness: 0, uLightIntensity: 1, uContrast: 1.4, uSaturation: 2, uGamma: 0.9, uRimPower: 2.5, uRimColor: { r: 255, g: 100, b: 0 }, uFresnelStrength: 3, uGlowRadius: 0.6, bloomStrength: 2 },
  'Plasma Storm': { noiseType: 'plasma', geometryType: 'torusknot', uColorA: { r: 0, g: 0, b: 50 }, uColorB: { r: 100, g: 0, b: 200 }, uColorC: { r: 0, g: 200, b: 255 }, uColorD: { r: 255, g: 255, b: 255 }, uScale: 2, uSpeed: 1.5, uDisplacementStrength: 0.6, uTwist: 1.5, uPulse: 4, uMorphFactor: 0.2, uMetalness: 0.2, uLightIntensity: 1.2, uContrast: 1.5, uSaturation: 1.8, uGamma: 1, uRimPower: 3, uRimColor: { r: 100, g: 200, b: 255 }, uFresnelStrength: 4, uGlowRadius: 1.5, bloomStrength: 2.5 },
  'Domain Warp': { noiseType: 'warp', geometryType: 'dodecahedron', uColorA: { r: 10, g: 0, b: 30 }, uColorB: { r: 80, g: 20, b: 100 }, uColorC: { r: 200, g: 100, b: 220 }, uColorD: { r: 255, g: 200, b: 255 }, uScale: 1.8, uSpeed: 0.4, uDisplacementStrength: 0.5, uTwist: 1, uPulse: 2.5, uMorphFactor: 0.2, uMetalness: 0.3, uLightIntensity: 1.2, uContrast: 1.3, uSaturation: 1.7, uGamma: 1.1, uRimPower: 3.5, uRimColor: { r: 200, g: 100, b: 255 }, uFresnelStrength: 4, uGlowRadius: 0.8, bloomStrength: 1.8 },
  'Hex Grid': { noiseType: 'hex', geometryType: 'plane', uColorA: { r: 5, g: 5, b: 15 }, uColorB: { r: 20, g: 20, b: 60 }, uColorC: { r: 80, g: 80, b: 200 }, uColorD: { r: 180, g: 180, b: 255 }, uScale: 6, uSpeed: 0.2, uDisplacementStrength: 0.1, uTwist: 0, uPulse: 1, uMorphFactor: 0, uMetalness: 0.5, uLightIntensity: 1.4, uContrast: 1.5, uSaturation: 1.2, uGamma: 0.95, uRimPower: 5, uRimColor: { r: 150, g: 150, b: 255 }, uFresnelStrength: 7, uGlowRadius: 0.4, bloomStrength: 1.5 },
  'Industrial Rust': { noiseType: 'voronoi', geometryType: 'gear', uColorA: { r: 12, g: 8, b: 5 }, uColorB: { r: 85, g: 45, b: 25 }, uColorC: { r: 180, g: 95, b: 45 }, uColorD: { r: 210, g: 170, b: 120 }, uScale: 3.2, uSpeed: 0.22, uDisplacementStrength: 0.45, uTwist: 0.25, uPulse: 1.4, uMorphFactor: 0.1, uMetalness: 0.85, uLightIntensity: 1.7, uContrast: 1.3, uSaturation: 1.15, uGamma: 1.05, uRimPower: 2.4, uRimColor: { r: 210, g: 140, b: 80 }, uFresnelStrength: 3.2, uGlowRadius: 0.45, bloomStrength: 1.1 },
};

export const LEGACY_SHADERTOY_TEMPLATES = {
  'Hello World': `void mainImage(out vec4 fragColor, in vec2 fragCoord) { vec2 uv = fragCoord / iResolution.xy; vec3 col = 0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0.0, 2.0, 4.0)); fragColor = vec4(col, 1.0); }`,
  'Audio Visualizer': `void mainImage(out vec4 fragColor, in vec2 fragCoord) { vec2 uv = fragCoord / iResolution.xy; float fft = texture2D(iChannel0, vec2(uv.x, 0.25)).r; vec3 col = vec3(0.0); col += vec3(0.0, 1.0, 0.3) * step(uv.y, fft); fragColor = vec4(col, 1.0); }`,
} as const;

function rgbToHex(rgb: { r: number; g: number; b: number }) {
  const toHex = (value: number) => value.toString(16).padStart(2, '0');
  return `#${toHex(Math.max(0, Math.min(255, Math.round(rgb.r))))}${toHex(Math.max(0, Math.min(255, Math.round(rgb.g))))}${toHex(Math.max(0, Math.min(255, Math.round(rgb.b))))}`;
}

export function buildLegacyShaderPair(noiseType: LegacyNoise) {
  const chunk = LEGACY_SHADER_CHUNKS[noiseType] ?? LEGACY_SHADER_CHUNKS.simplex;
  return {
    vertex: `${chunk}\n${vertexShaderMain}`,
    fragment: `${chunk}\n${fragmentShaderMain}`,
  };
}

export function applyLegacyPresetToShaderParams(current: ShaderParams, preset: LegacyPreset): ShaderParams {
  return {
    ...current,
    geometry: preset.geometryType,
    noise: preset.noiseType,
    speed: preset.uSpeed,
    amplitude: preset.uDisplacementStrength,
    scale: preset.uScale,
    colors: {
      ...current.colors,
      color1: rgbToHex(preset.uColorA),
      color2: rgbToHex(preset.uColorB),
      color3: rgbToHex(preset.uColorC),
    },
    material: {
      ...current.material,
      metalness: preset.uMetalness,
      rimPower: preset.uRimPower,
      fresnelStrength: preset.uFresnelStrength,
      twist: preset.uTwist,
      pulse: preset.uPulse,
      morphFactor: preset.uMorphFactor,
    },
    postProcessing: {
      ...current.postProcessing,
      bloom: true,
      bloomIntensity: preset.bloomStrength ?? current.postProcessing.bloomIntensity,
      glitch: Boolean(preset.glitchMode),
    },
    wireframe: Boolean(preset.wireframe),
  };
}
