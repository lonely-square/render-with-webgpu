import $ from 'jquery';
import  vertexShader  from './shader/vertex_01.wgsl';
import  fragmentShader  from './shader/fragment_01.wgsl';
import { objMesh } from './obj_mesh';
import { vec3 } from 'gl-matrix';
import { getTransformationMatrix } from './matrix'

const createObj = async (modelUrl : string,texUrl : string[])=>{

    const canvas = document.getElementById('canvas-webgpu') as HTMLCanvasElement;
    const adapter = await navigator.gpu?.requestAdapter() as GPUAdapter;
    const device = await adapter?.requestDevice() as GPUDevice;
    const context = canvas.getContext('webgpu') as unknown as GPUCanvasContext;

    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
        device,
        format: presentationFormat,
        alphaMode: 'opaque',
    });

    var lanternObj = new objMesh()
    await lanternObj.initialize(modelUrl)
    

    //绑定资源部分
    const vertexBufferList: GPUBuffer[]=[]
    const cubeTextureList: GPUTexture[]=[]
    const bindGroupList : GPUBindGroup[]=[]

    texUrl.forEach((url)=>{
        const name = url.split('/').pop()        
        const verticesTemp=lanternObj.vertices.filter(obj => `${obj.uvname}.jpg` === name)[0];
        lanternObj.vertices.push(verticesTemp)

    })
    texUrl.forEach(()=>{
        lanternObj.vertices.shift()
    })
    
    console.log(lanternObj.vertices)

    //模型数据放入缓存
    let count=0;
    for (let url of texUrl){
        const texture = new Image()
        texture.src = url
        await texture.decode()

        const imageBitmap = await createImageBitmap(texture);
    
        const cubeTexture = device.createTexture({
        size: [imageBitmap.width, imageBitmap.height, 1],
        format: 'rgba8unorm',
        usage:
            GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_DST |
            GPUTextureUsage.RENDER_ATTACHMENT,
        });
        device.queue.copyExternalImageToTexture(
        { source: imageBitmap },
        { texture: cubeTexture },
        [imageBitmap.width, imageBitmap.height]
        );

        cubeTextureList.push(cubeTexture)

           
        //Buffer has been created, now load in the vertices

        const vertexBufferDescriptor: GPUBufferDescriptor = {
            size: lanternObj.vertices[count].vertex.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true // similar to HOST_VISIBLE, allows buffer to be written by the CPU
        };
        const buffer = device.createBuffer(vertexBufferDescriptor);
        new Float32Array(buffer.getMappedRange())
        .set(lanternObj.vertices[count].vertex);
        buffer.unmap();
        vertexBufferList.push(buffer);
        
        count++
    }
    

    

    //设置BindGroupLayout
    const piplineGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer : {type : 'uniform'}
            },
            {
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                sampler: {
                    type: "filtering"
                }
            },
            {
              binding: 2,
              visibility: GPUShaderStage.FRAGMENT,
              texture: {
                sampleType: "float"
              }
            },
        ]

    });

    //设置深度信息
    const depthTexture = device.createTexture({
        size: [canvas.width, canvas.height],
        format: 'depth24plus',
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });


    const pipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({bindGroupLayouts:[piplineGroupLayout]}),
        vertex: {
            module: device.createShaderModule({
                code: vertexShader
            }),
            entryPoint: "main",
            buffers:[    
                {
                    arrayStride: 20,
                    attributes: [
                        {
                            shaderLocation: 0,
                            format: "float32x3",
                            offset: 0
                        },
                        {
                            shaderLocation: 1,
                            format: "float32x2",
                            offset: 12
                        }
                    ]
                }    
            ]
        },
        fragment: {
            module: device.createShaderModule({
                code: fragmentShader,
            }),
        entryPoint: 'main',
        targets: [
            {
            format: presentationFormat,
            },
        ],
        },
        primitive: {
            topology: 'triangle-list',
            // cullMode: 'back',
        },
        depthStencil: {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus',
        },
    });



    const mvpMatrix = device.createBuffer({
        size : 4*4*4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const sampler = device.createSampler({
        magFilter: 'linear',
        minFilter: 'linear',
      });

    
    texUrl.forEach((url,index)=>{
        const uniformBindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
              {
                binding: 0,
                resource: {
                  buffer: mvpMatrix,
                }
              },
              {
                binding: 1,
                resource: sampler,
              },
              {
                binding: 2,
                resource: cubeTextureList[index].createView(),
              },
            ],
          });

          bindGroupList.push(uniformBindGroup);

    })
    console.log(bindGroupList[1] == bindGroupList[0])


      const position = {x:0,y:0,z:-1}
      const rotation = {x:0,y:0,z:0}
      const scale = {x:1,y:1,z:1}
    
  

    function frame() {
        rotation.x += 0.001;
        rotation.y += 0.00;
        rotation.z += 0.001;  
    
    
        const transformationMatrix = getTransformationMatrix(canvas.width/canvas.height,
            vec3.fromValues(position.x,position.y,position.z),
            vec3.fromValues(rotation.x,rotation.y,rotation.z),
            vec3.fromValues(scale.x,scale.y,scale.z)
        );
        
       
        device.queue.writeBuffer(
          mvpMatrix,
          0,
          transformationMatrix.buffer,
          transformationMatrix.byteOffset,
          transformationMatrix.byteLength
        );

       
        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();
    
        const renderPassDescriptor: GPURenderPassDescriptor = {
          colorAttachments: [
            {
              view: textureView,
              clearValue: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
              loadOp: 'clear',
              storeOp: 'store',
            },
          ],
          depthStencilAttachment: {
            view: depthTexture.createView(),
      
            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
          },
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        

        texUrl.forEach((url,index)=>{
            passEncoder.setPipeline(pipeline);
            passEncoder.setBindGroup(0,bindGroupList[index]);
            passEncoder.setVertexBuffer(0,vertexBufferList[index]);
            passEncoder.draw(lanternObj.vertices[index].vertexCount, 1, 0, 0);
            
        })

        passEncoder.end();
        device.queue.submit([commandEncoder.finish()]);

        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);

    

}


const main =async () => {

    if (!navigator.gpu){
        throw('Your current browser does not support WebGPU!');
    }

    await createObj("./model/lantern/lantern.obj",["./model/lantern/tex/000001B95523DFF8.jpg","./model/lantern/tex/000001B955240538.jpg"]);
    
}

main();
