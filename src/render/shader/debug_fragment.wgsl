
@group(0) @binding(1) var mySampler: sampler;
@group(0) @binding(9) var dTexture: texture_2d<f32>;
//物体旋转矩阵
@group(0) @binding(6) var<uniform> rotationMatrix : mat4x4<f32>;
//摄像机位置
@group(0) @binding(7) var<uniform> cameraPos : vec3<f32>;
//材质参数
@group(0) @binding(8) var<uniform> texConfig : TexConfig;

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

@fragment
fn main(@location(0) pos: vec4<f32>
) -> @location(0) vec4<f32> {

    let kd = textureSample(shadowMap, mySampler, vec2<f32>((pos.x+1.0)/2.0,1.0-(pos.y+1.0)/2.0) );
    return vec4<f32>(kd);

}