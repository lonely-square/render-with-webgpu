@group(0) @binding(1) var mySampler: sampler;
@group(0) @binding(2) var kdTexture: texture_2d<f32>;
@group(0) @binding(3) var bumpTexture: texture_2d<f32>;
@group(0) @binding(4) var ksTexture: texture_2d<f32>;
@group(0) @binding(9) var dTexture: texture_2d<f32>;
//物体旋转矩阵
@group(0) @binding(6) var<uniform> rotationMatrix : mat4x4<f32>;
//入射光方向
@group(0) @binding(5) var<uniform> lightDirection : vec3<f32>;
//摄像机位置
@group(0) @binding(7) var<uniform> cameraPos : vec3<f32>;
//材质参数
@group(0) @binding(8) var<uniform> texConfig : TexConfig;

struct TexConfig{
   //
    Ns : f32,
    Ni : f32,
    d :f32,
    illum :f32,
    //
    ka :vec3<f32>,
    kd :vec3<f32>,
    //
    ks :vec3<f32>,
    //
    ke :vec3<f32>,
}

@fragment
fn main(
  @location(0) pos: vec4<f32>, 
  @location(1) uv: vec2<f32>,
  //法线
  @location(2) nv : vec3<f32>
) -> @location(0) vec4<f32> {

    let kd = textureSample(kdTexture, mySampler, uv);
    let bump = textureSample(bumpTexture, mySampler, uv);
    let ks = textureSample(ksTexture, mySampler, uv);
    let d = textureSample(dTexture, mySampler, uv);


    //世界坐标的法线
    let n1=rotationMatrix*vec4<f32>(normalize(nv*vec3<f32>(bump[0],bump[1],bump[2])),1.0);
    let n=vec3<f32>(n1[0],n1[1],n1[2]);

    var reflection_dir=normalize(reflect(normalize(lightDirection), n));

    // if( dot(lightDirection, n) >= 0.0) {
    //    reflection_dir= vec3<f32>(0.0,0.0,0.0);
    // };
    
    //a漫反射角度系数
    let a=dot(vec4<f32>(-normalize(lightDirection),1.0),vec4<f32>(n,1.0))-1;
    //b镜面反射角度系数
    let b= dot(reflection_dir,normalize(cameraPos-vec3<f32>(pos[0],pos[1],pos[2])));

    let res=
    vec4<f32>(0.1,0.1,0.1,0.0)*vec4<f32>(texConfig.ka,1.0)+
    vec4<f32>(1.0,1.0,1.0,0.0)*saturate(abs(a)*kd)+
    vec4<f32>(0.3,0.3,0.3,0.0)*saturate(pow(b,texConfig.Ns)*ks)+
    vec4<f32>(0.0,0.0,0.0,d.a)
    ;

    return res;
}
