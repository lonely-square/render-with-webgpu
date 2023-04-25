@group(0) @binding(1) var mySampler: sampler;
@group(0) @binding(2) var kdTexture: texture_2d<f32>;
@group(0) @binding(3) var bumpTexture: texture_2d<f32>;
@group(0) @binding(4) var ksTexture: texture_2d<f32>;
@group(0) @binding(9) var dTexture: texture_2d<f32>;
//物体旋转矩阵
@group(0) @binding(6) var<uniform> rotationMatrix : mat4x4<f32>;
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
//灯光
@group(0) @binding(5) var<storage> lightConfig : lightConfig_;

struct lightConfig_{
    count: f32,
    light:array<light_>,
}

struct light_{
  type_: f32,
  color: vec3<f32>,
  positon: vec3<f32>,
}

@fragment
fn main(
  @location(0) pos: vec4<f32>, 
  @location(1) uv: vec2<f32>,
  //法线
  @location(2) nv : vec3<f32>
) -> @location(0) vec4<f32> {

    
    let d = textureSample(dTexture, mySampler, uv);
    let ks = vec4<f32>(texConfig.ks,1.0);
    let kd = d;

    //世界坐标的法线
    let n1=rotationMatrix*vec4<f32>(nv,1.0);
    let n=vec3<f32>(n1[0],n1[1],n1[2]);


    
    var res=vec4<f32>(0.0);
    for(var i=0u;i<u32(lightConfig.count);i++){
      //灯光
      let lightcolor =lightConfig.light[i].color/vec3<f32>(255.0);
      let lightDirection = vec3<f32>(0.0)-lightConfig.light[i].positon;
      var reflection_dir=normalize(reflect(normalize(lightDirection), n));

      if( dot(lightDirection, n) >= 0.0) {
         reflection_dir= vec3<f32>(0.0,0.0,0.0);
      };
      
      //a漫反射角度系数
      let a=dot(vec4<f32>(-normalize(lightDirection),1.0),vec4<f32>(n,1.0))-1;
      //b镜面反射角度系数
      let b= dot(reflection_dir,normalize(cameraPos-vec3<f32>(pos[0],pos[1],pos[2])));

      res=
      res+
      // vec4<f32>(0.1,0.1,0.1,0.0)*vec4<f32>(texConfig.ka,1.0)+
      // vec4<f32>(1.0,1.0,1.0,0.0)*saturate(a*kd)+
      // vec4<f32>(0.3,0.3,0.3,0.0)*saturate(pow(b,texConfig.Ns)*ks)+
      // vec4<f32>(0.0,0.0,0.0,d.a);
      vec4<f32>(0.1,0.1,0.1,0.0)*vec4<f32>( vec4<f32>(lightcolor,1.0)*kd )+
      vec4<f32>(1.0,1.0,1.0,0.0)*saturate(a*vec4<f32>(lightcolor,1.0)*kd)+
      vec4<f32>(0.3,0.3,0.3,0.0)*saturate(pow(b,texConfig.Ns)*ks*vec4<f32>(lightcolor,1.0))+
      vec4<f32>(0.0,0.0,0.0,d.a);
    }
    // var c=f32(arrayLength(&lightConfig));
    // var t:f32=c-12.0;

    return res;
    // return vec4<f32>( vec3<f32>( t),1.0);
}
