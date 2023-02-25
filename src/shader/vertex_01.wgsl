struct vertexOutput{
    @builtin(position) position : vec4<f32>,
}

@vertex
fn main(@builtin(vertex_index) index : u32 ,
        @location(0) position : vec3<f32>,
        @location(1) uv : vec2<f32>
 ) -> vertexOutput {

  var a: vertexOutput;
  a.position = vec4<f32>(position,1.0);
  
  return a;
}