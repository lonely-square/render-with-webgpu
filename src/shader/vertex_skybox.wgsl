@group(0) @binding(0) var<uniform> mvp : mat4x4<f32>;
//世界坐标
@group(0) @binding(10) var<uniform> m : mat4x4<f32>;
@group(0) @binding(14) var<uniform> lm : mat4x4<f32>;
//物体坐标
@group(0) @binding(15) var<uniform> modelMat : mat4x4<f32>;
@group(0) @binding(16) var<uniform> vp: mat4x4<f32>;

struct vertexOutput{
    @builtin(position) position : vec4<f32>,
    @location(0) pos : vec4<f32>,
    @location(1) uv : vec2<f32>,
    @location(2) nv : vec3<f32>,
    @location(3) modelPos : vec3<f32>,
    @location(4) shadowPos: vec3<f32>
}

@vertex
fn main(@builtin(vertex_index) index : u32 ,
        @location(0) position : vec3<f32>,
        @location(1) uv : vec2<f32>,
        @location(2) nv : vec3<f32>,
 ) -> vertexOutput {

  let posFromLight = lm * m * modelMat *vec4(position, 1.0);

  var a: vertexOutput;
  //裁剪坐标
  a.position = vp * modelMat * vec4<f32>(position,1.0);
  //世界坐标
  a.pos=  m* modelMat *vec4<f32>(position,1.0);
  //模型坐标
  a.modelPos=position;
  //灯光坐标下的深度
  a.shadowPos = vec3(
    posFromLight.xy * vec2(0.5, -0.5) + vec2(0.5),
    posFromLight.z
  );
  a.uv=uv;
  a.nv=(modelMat *vec4<f32>(nv,1.0)).xyz;

  return a;
}