@group(0) @binding(0) var<uniform> m : mat4x4<f32>;
@group(0) @binding(1) var<uniform> lm : mat4x4<f32>;

struct vertexOutput{
    @builtin(position) position : vec4<f32>,
}

@vertex
fn main(@builtin(vertex_index) index : u32 ,
        @location(0) position : vec3<f32>,
 ) -> vertexOutput {

  var a: vertexOutput;
  //灯光坐标
  a.position =lm* m*vec4<f32>(position,1.0);

  return a;
}