@group(0) @binding(0) var<uniform> mvp : mat4x4<f32>;
@group(0) @binding(10) var<uniform> m : mat4x4<f32>;

struct vertexOutput{
    @builtin(position) position : vec4<f32>,
    @location(0) pos : vec4<f32>,
    @location(1) uv : vec2<f32>,
    @location(2) nv : vec3<f32>
}

@vertex
fn main(@builtin(vertex_index) index : u32 ,
        @location(0) position : vec3<f32>,
        @location(1) uv : vec2<f32>,
        @location(2) nv : vec3<f32>
 ) -> vertexOutput {

  var a: vertexOutput;
  //裁剪坐标
  a.position = mvp*vec4<f32>(position,1.0);
  //世界坐标
  a.pos= m*vec4<f32>(position,1.0);
  a.uv=uv;
  a.nv=nv;

  return a;
}