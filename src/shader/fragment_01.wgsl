@group(0) @binding(1) var mySampler: sampler;
@group(0) @binding(2) var kdTexture: texture_2d<f32>;
@group(0) @binding(3) var bumpTexture: texture_2d<f32>;
@group(0) @binding(4) var ksTexture: texture_2d<f32>;
@group(0) @binding(5) var<uniform> lightDirection : vec3<f32>;

@fragment
fn main(@location(0) pos: vec3<f32>, 
  @location(1) uv: vec2<f32>,
  @location(2) nv : vec3<f32>
) -> @location(0) vec4<f32> {

    var kd = textureSample(kdTexture, mySampler, uv);
    var bump = textureSample(bumpTexture, mySampler, uv);
    var ks = textureSample(ksTexture, mySampler, uv);

    var a=dot(vec4<f32>(lightDirection,1.0),vec4<f32>(nv,1.0));
    return vec4<f32>(0.5,0.5,0.5,1.0)*a*kd;
}
