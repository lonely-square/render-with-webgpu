import $ from 'jquery';
import { CheckWebGPU } from './helper';
import  vertexShader  from './shader/vertex_01.wgsl';
import  fragmentShader  from './shader/fragment_01.wgsl';
import { objMesh } from './obj_mesh';
import { vec3 } from 'gl-matrix';
import { getTransformationMatrix } from './matrix'


const CreateTrangle =async () => {
    const checkgpu = CheckWebGPU();
    if (checkgpu.includes('Your current browser does not support WebGPU!')){
        throw('Your current browser does not support WebGPU!');
    }

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
    await lanternObj.initialize("./model/lantern/lantern.obj")

    const piplineGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer : {type : 'uniform'}
            }
        ]

    });
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


    //绑定资源部分
    var buffer: GPUBuffer
    //模型数据放入缓存
    { 
    const usage: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;
    //VERTEX: the buffer can be used as a vertex buffer
    //COPY_DST: data can be copied to the buffer

    const descriptor: GPUBufferDescriptor = {
        size: lanternObj.vertices.byteLength,
        usage: usage,
        mappedAtCreation: true // similar to HOST_VISIBLE, allows buffer to be written by the CPU
    };

    buffer = device.createBuffer(descriptor);

    //Buffer has been created, now load in the vertices
    new Float32Array(buffer.getMappedRange()).set(lanternObj.vertices);
    buffer.unmap();
    }
    const mvpMatrix = device.createBuffer({
        size : 4*4*4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const uniformBindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: {
              buffer: mvpMatrix,
            }
          },
        ],
      });




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
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0,uniformBindGroup);
        passEncoder.setVertexBuffer(0,buffer);
        passEncoder.draw(lanternObj.vertexCount, 1, 0, 0);
        passEncoder.end();
        device.queue.submit([commandEncoder.finish()]);

        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
}

CreateTrangle();
