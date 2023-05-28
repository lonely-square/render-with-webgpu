@group(0) @binding(0) var<uniform> mvp : mat4x4<f32>;
@group(0) @binding(10) var<uniform> m : mat4x4<f32>;
@group(0) @binding(14) var<uniform> lm : mat4x4<f32>;

struct vertexOutput{
     @builtin(position) position : vec4<f32>,
     @location(0) position_ : vec4<f32>
}

@vertex
fn main(@builtin(vertex_index) index : u32 ,
        @location(0) position : vec3<f32>,
 ) -> vertexOutput {

  var a: vertexOutput;
  a.position = vec4<f32>(position.xy/5.0 - 0.8,0.0,1.0);
  a.position_ = vec4<f32>(position.xy,1.0,1.0);

  return a;
}