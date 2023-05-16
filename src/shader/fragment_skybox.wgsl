

@group(0) @binding(1) var mySampler: sampler;
@group(0) @binding(9) var dTexture: texture_2d<f32>;
//物体旋转矩阵
@group(0) @binding(6) var<uniform> rotationMatrix : mat4x4<f32>;
//摄像机位置
@group(0) @binding(7) var<uniform> cameraPos : vec3<f32>;
//材质参数
@group(0) @binding(8) var<uniform> texConfig : TexConfig;

@group(0) @binding(11) var skyTexture: texture_cube<f32>;

//阴影
@group(0) @binding(12) var shadowMap: texture_depth_2d;
@group(0) @binding(13) var shadowSampler: sampler_comparison;

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
  positon: vec3<f32>
}

@fragment
fn main(
    @location(0) pos: vec4<f32>, 
    @location(1) uv: vec2<f32>,
    //法线
    @location(2) nv : vec3<f32>,
    @location(3) modelPos : vec3<f32>,
    @location(4) shadowPos : vec3<f32>
    
) -> @location(0) vec4<f32> {

    var pos1 =modelPos;
    pos1.x-=cameraPos.x;
    pos1.y-=cameraPos.y;
    pos1.z-=cameraPos.z;


    return textureSample( skyTexture,  mySampler, pos1);
}