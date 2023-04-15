@group(0) @binding(1) var mySampler: sampler;
@group(0) @binding(2) var myTexture: texture_2d<f32>;

@fragment
fn main(@location(0) pos : vec3<f32>,@location(1) uv: vec2<f32>) -> @location(0) vec4<f32> {
  return textureSample(myTexture, mySampler, uv);
  // vec4(0,1,1,1);
  // textureSample(myTexture, mySampler, uv);
}
