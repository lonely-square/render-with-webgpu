import $ from 'jquery';
import { CheckWebGPU } from './helper';
import  vertexShader  from './shader/vertex_01.wgsl';
import  fragmentShader  from './shader/fragment_01.wgsl';
import { objMesh } from './obj_mesh';


const CreateTrangle =async (color=`(1.0,1.0,1.0,1.0)`) => {
    const checkgpu = CheckWebGPU();
    if (checkgpu.includes('Your current browser does not support WebGPU!')){
        console.log(checkgpu);
        throw('Your current browser does not support WebGPU!');
    }

    const canvas = document.getElementById('canvas-webgpu') as HTMLCanvasElement;
    const adapter = await navigator.gpu?.requestAdapter() as GPUAdapter;
    const device = await adapter?.requestDevice() as GPUDevice;
    const context = canvas.getContext('webgpu') as GPUCanvasContext;

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
    lanternObj.initialize("./model/lantern/lantern.obj")

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
    

    const pipeline = device.createRenderPipeline({
        layout: 'auto',
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
        },
    });

    frame();
    requestAnimationFrame(frame);

    function frame() {
 
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
        };
    
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(pipeline);
        passEncoder.setVertexBuffer(0,buffer);
        passEncoder.draw(lanternObj.vertexCount, 1, 0, 0);
        passEncoder.end();
    
        device.queue.submit([commandEncoder.finish()]);
        requestAnimationFrame(frame);
      }
}

CreateTrangle();
