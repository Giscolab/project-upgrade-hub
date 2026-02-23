import { ShaderParams } from '@/types/shader';

const SHADERTOY_NOISE_CHUNKS: Partial<Record<ShaderParams['noise'], string>> = {
  simplex: `
vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);} 
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.0);
  vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
  m=m*m;m=m*m;
  vec3 x2=2.*fract(p*C.www)-1.;vec3 h=abs(x2)-0.5;
  vec3 ox=floor(x2+0.5);vec3 a0=x2-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.*dot(m,g);
}
float getNoise(vec2 st){return snoise(st);} 
`,
  voronoi: `
vec2 rnd2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);} 
float getNoise(vec2 st){
  vec2 i=floor(st),f=fract(st);float m=1.;
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
    vec2 nb=vec2(float(x),float(y));
    vec2 pt=rnd2(i+nb);pt=0.5+0.5*sin(6.2831*pt);
    m=min(m,length(nb+pt-f));
  }return m;
}
`,
  fbm: `
float _r(vec2 s){return fract(sin(dot(s,vec2(12.9898,78.233)))*43758.5453);} 
float _n(vec2 s){vec2 i=floor(s),f=fract(s);float a=_r(i),b=_r(i+vec2(1,0)),c=_r(i+vec2(0,1)),d=_r(i+vec2(1,1));vec2 u=f*f*(3.-2.*f);return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;} 
float getNoise(vec2 st){float v=0.,a=0.5;mat2 r=mat2(.8,.6,-.6,.8);for(int i=0;i<6;i++){v+=a*_n(st);st=r*st*2.+100.;a*=.5;}return v;} 
`,
  ridged: `
float _r(vec2 s){return fract(sin(dot(s,vec2(12.9898,78.233)))*43758.5453);} 
float _n(vec2 s){vec2 i=floor(s),f=fract(s);float a=_r(i),b=_r(i+vec2(1,0)),c=_r(i+vec2(0,1)),d=_r(i+vec2(1,1));vec2 u=f*f*(3.-2.*f);return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;} 
float getNoise(vec2 st){float v=0.,a=.5,freq=1.;for(int i=0;i<6;i++){float n=1.-abs(_n(st*freq)-.5)*2.;v+=a*n*n;freq*=2.;a*=.5;}return v;} 
`,

  plasma: `
float getNoise(vec2 st){
  float v=sin(st.x*3.)+sin(st.y*3.)+sin((st.x+st.y)*3.)+sin(sqrt(st.x*st.x+st.y*st.y)*6.);
  return v*.25;
}
`,
  galaxy: `
float getNoise(vec2 st){
  vec2 c=st-.5;float r=length(c),a=atan(c.y,c.x);
  float swirl=sin(r*8.-a*3.);float arms=sin(a*5.+r*4.)*exp(-r*2.);
  return (swirl*.5+arms)*.5+.5;
}
`,
  marble: `
float _r(vec2 s){return fract(sin(dot(s,vec2(12.9898,78.233)))*43758.5453);} 
float _n(vec2 s){vec2 i=floor(s),f=fract(s);float a=_r(i),b=_r(i+vec2(1,0)),c=_r(i+vec2(0,1)),d=_r(i+vec2(1,1));vec2 u=f*f*(3.-2.*f);return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;} 
float fbmM(vec2 s){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*_n(s);s*=2.01;a*=.5;}return v;}
float getNoise(vec2 st){float n=fbmM(st);return sin(st.x*4.+n*6.)*.5+.5;}
`,
  acid: `
float getNoise(vec2 st){
  float v=sin(st.x*5.+st.y*3.)+sin(st.x*3.-st.y*7.)*.7+sin((st.x+st.y)*4.)*.5+sin(sqrt(st.x*st.x+st.y*st.y)*8.)*.4+sin(st.x*9.)*sin(st.y*7.)*.3;
  return v*.2;
}
`,
  cellular: `
vec2 rnd2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);} 
float getNoise(vec2 st){
  vec2 i=floor(st),f=fract(st);
  float m1=1.,m2=1.;
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
    vec2 nb=vec2(float(x),float(y));
    vec2 pt=rnd2(i+nb);
    float d=length(nb+pt-f);
    if(d<m1){m2=m1;m1=d;}else if(d<m2){m2=d;}
  }
  return m2-m1;
}
`,
  warp: `
float _r(vec2 s){return fract(sin(dot(s,vec2(12.9898,78.233)))*43758.5453);} 
float _n(vec2 s){vec2 i=floor(s),f=fract(s);float a=_r(i),b=_r(i+vec2(1,0)),c=_r(i+vec2(0,1)),d=_r(i+vec2(1,1));vec2 u=f*f*(3.-2.*f);return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;} 
float fbmW(vec2 s){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*_n(s);s*=2.;a*=.5;}return v;}
float getNoise(vec2 st){
  vec2 q=vec2(fbmW(st),fbmW(st+vec2(1.7,9.2)));
  vec2 r=vec2(fbmW(st+4.*q+vec2(1.7,9.2)),fbmW(st+4.*q+vec2(8.3,2.8)));
  return fbmW(st+4.*r);
}
`,
  truchet: `
float _r(vec2 s){return fract(sin(dot(s,vec2(127.1,311.7)))*43758.5453);} 
float getNoise(vec2 st){
  vec2 i=floor(st),f=fract(st);
  float r=step(0.5,_r(i));
  float d1=length(f-vec2(0.,0.));float d2=length(f-vec2(1.,1.));
  float d3=length(f-vec2(1.,0.));float d4=length(f-vec2(0.,1.));
  float arc1=min(abs(d1-.5),abs(d2-.5));
  float arc2=min(abs(d3-.5),abs(d4-.5));
  return mix(arc1,arc2,r)*2.;
}
`,
  mandel: `
float getNoise(vec2 st){
  vec2 c=(st-.5)*2.5;vec2 z=vec2(0.);
  int iter=0;
  for(int i=0;i<32;i++){
    if(dot(z,z)>4.) break;
    z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+c;
    iter++;
  }
  return float(iter)/32.;
}
`,
  wave: `
float getNoise(vec2 st){
  float v=0.;
  for(int i=0;i<5;i++){
    float fi=float(i);
    vec2 center=vec2(cos(fi*1.2+.5)*.5+.5,sin(fi*.9+1.3)*.5+.5);
    float d=length(st-center);
    v+=sin(d*20.-fi*1.5)/(d*8.+1.);
  }
  return v*.3;
}
`,
  hex: `
vec2 hexRound(vec2 p){
  vec2 q=vec2(p.x*1.1547,p.y+p.x*.5774);
  vec2 qi=floor(q);vec2 qf=fract(q);
  float s=(qf.x+qf.y<1.)?0.:1.;
  return qi+s;
}
float _r(vec2 s){return fract(sin(dot(s,vec2(127.1,311.7)))*43758.5453);} 
float getNoise(vec2 st){
  st*=2.;
  vec2 hc=hexRound(st);
  vec2 center=vec2(hc.x*.8660,hc.y-.5*hc.x*.5774);
  float d=length(st-center);
  float border=smoothstep(.4,.45,d);
  return border+_r(hc)*.3;
}
`,
  react: `
float getNoise(vec2 st){
  vec2 p = st * 3.0;
  for(int i=0; i<5; i++){
    p.x += sin(p.y + iTime * 0.5);
    p.y += cos(p.x + iTime * 0.5);
  }
  return sin(length(p)) * 0.5 + 0.5;
}
`,
};

function toVec3(hex: string): string {
  const clean = hex.replace('#', '');
  const expanded = clean.length === 3 ? clean.split('').map((char) => char + char).join('') : clean;
  const parsed = Number.parseInt(expanded, 16);
  const r = ((parsed >> 16) & 255) / 255;
  const g = ((parsed >> 8) & 255) / 255;
  const b = (parsed & 255) / 255;
  return `vec3(${r.toFixed(4)}, ${g.toFixed(4)}, ${b.toFixed(4)})`;
}

export function buildShadertoyShaderFromParams(params: ShaderParams, channels: Array<string | null> = []): string {
  const chunk = SHADERTOY_NOISE_CHUNKS[params.noise] ?? SHADERTOY_NOISE_CHUNKS.simplex;
  const speed = params.speed.toFixed(3);
  const scale = params.scale.toFixed(3);
  const amp = params.amplitude.toFixed(3);
  const freq = params.frequency.toFixed(3);
  const hasAudio = Boolean(channels[0]);

  return `// Export ShaderToy — généré depuis la version React\n// iChannel0 optionnel pour l'audio (FFT)\n\n${chunk}\n\nmat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }\n\nvoid mainImage(out vec4 fragColor, in vec2 fragCoord) {\n  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;\n  float t = iTime * ${speed};\n\n  vec2 p = uv * ${scale};\n  p *= rot(t * 0.25);\n\n  float n1 = getNoise(p * ${freq} + vec2(t, -t * 0.7));\n  float n2 = getNoise(p * (${freq} * 1.6) - vec2(t * 0.6, t));\n  float n = mix(n1, n2, 0.45);\n\n  float ring = smoothstep(0.52, 0.18, abs(length(uv) - (0.28 + n * ${amp})));\n  float glow = exp(-3.2 * length(uv - vec2(0.0, 0.08 * sin(t * 1.8))));\n\n  vec3 col = mix(${toVec3(params.colors.color1)}, ${toVec3(params.colors.color2)}, 0.5 + 0.5 * n);\n  col = mix(col, ${toVec3(params.colors.color3)}, ring * 0.8);\n  col += glow * 0.24;\n\n  ${hasAudio ? 'float fft = texture(iChannel0, vec2(0.07, 0.25)).x;\n  col *= 1.0 + fft * 0.35;' : '// Astuce: brancher un canal audio FFT sur iChannel0 pour moduler la couleur.'}\n\n  fragColor = vec4(pow(max(col, 0.0), vec3(0.95)), 1.0);\n}\n`;
}

export function exportShadertoyShader(params: ShaderParams, channels: Array<string | null> = []): string {
  const shaderCode = buildShadertoyShaderFromParams(params, channels);
  const blob = new Blob([shaderCode], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `shadertoy-${Date.now()}.frag`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return shaderCode;
}
