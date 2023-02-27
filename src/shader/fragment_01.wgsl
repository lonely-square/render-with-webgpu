@fragment
fn main(@location(0) pos : vec3<f32>) -> @location(0) vec4<f32> {
  return vec4(pos ,1.0);
}
