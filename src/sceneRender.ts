import { scene } from "./scene";
import { getTransformationMatrix } from './matrix'
import vertexShader from './shader/vertex_01.wgsl';
import fragmentShader from './shader/fragment_01.wgsl';
import { coords } from "./interface";
import { vec3 } from 'gl-matrix';
import { freemem } from "os";


export abstract class sceneRender extends scene {

    abstract switchScene(name: string): Promise<void>

    /**
  * 渲染场景
  * @param renderPass 渲染管线
  */
    protected async render() {
        
        await this.webGPURender()
    }

    private async webGPURender() {
        let that = this
        const context = that.canvas.getContext('webgpu') as unknown as GPUCanvasContext;

        const devicePixelRatio = window.devicePixelRatio || 1;
        that.canvas.width = that.canvas.clientWidth * devicePixelRatio;
        that.canvas.height = that.canvas.clientHeight * devicePixelRatio;
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

        context.configure({
            device: that.device,
            format: presentationFormat,
            alphaMode: 'opaque',
        });



        //绑定资源部分
        const vertexBufferList: GPUBuffer[] = []
        const textureList: GPUTexture[] = []
        const bindGroupList: GPUBindGroup[] = []


        //贴图，顶点数据放入缓存
        let count = 0;
        for (let vertices of that.obj.vertices) {
            //贴图数据
            const texture = new Image()
            texture.src = that.texUrl.filter(url => {
                return url.includes((that.mtl.mtl.get(vertices.mtlname) as any).map_Kd)
            })[0]
            await texture.decode()

            const imageBitmap = await createImageBitmap(texture);
            const cubeTexture = that.device.createTexture({
                size: [imageBitmap.width, imageBitmap.height, 1],
                format: 'rgba8unorm',
                usage:
                    GPUTextureUsage.TEXTURE_BINDING |
                    GPUTextureUsage.COPY_DST |
                    GPUTextureUsage.RENDER_ATTACHMENT,
            });
            that.device.queue.copyExternalImageToTexture(
                { source: imageBitmap },
                { texture: cubeTexture },
                [imageBitmap.width, imageBitmap.height]
            );

            textureList.push(cubeTexture)


            //顶点数据
            const vertexBufferDescriptor: GPUBufferDescriptor = {
                size: that.obj.vertices[count].vertex.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
                mappedAtCreation: true
            };
            const buffer = that.device.createBuffer(vertexBufferDescriptor);
            new Float32Array(buffer.getMappedRange())
                .set(that.obj.vertices[count].vertex);
            buffer.unmap();
            vertexBufferList.push(buffer);

            count++
        }


        //设置BindGroupLayout
        const piplineGroupLayout = that.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: 'uniform' }
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
        const depthTexture = that.device.createTexture({
            size: [that.canvas.width, that.canvas.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });

        //设置渲染管线
        const pipeline = that.device.createRenderPipeline({
            layout: that.device.createPipelineLayout({ bindGroupLayouts: [piplineGroupLayout] }),
            vertex: {
                module: that.device.createShaderModule({
                    code: vertexShader
                }),
                entryPoint: "main",
                buffers: [
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
                module: that.device.createShaderModule({
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


        //设置mvp缓存
        const mvpMatrix = that.device.createBuffer({
            size: 4 * 4 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        //设置采样器
        const sampler = that.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
        });

        //把所有资源打包进bindgroup
        that.obj.vertices.forEach((objConfig, index) => {
            const uniformBindGroup = that.device.createBindGroup({
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
                        resource: textureList[index].createView(),
                    },
                ],
            });

            bindGroupList.push(uniformBindGroup);

        })


        scene.switchFlag = false
  
        let flag = scene.switchFlag
        let name = that.name


        requestAnimationFrame(frame);
        function frame() {
            // that.sceneConfig.objConfig.rotation.x += 0.001;
            // that.sceneConfig.objConfig.rotation.y += 0.00;
            // that.sceneConfig.objConfig.rotation.z += 0.001;

 
            if (scene.switchFlag === true)  return


            draw(that.sceneConfig.objConfig.position, that.sceneConfig.objConfig.rotation, that.sceneConfig.objConfig.scale);
            requestAnimationFrame(frame);
        }

        function draw(position: coords, rotation: coords, scale: coords) {

            const transformationMatrix = getTransformationMatrix(that.canvas.width / that.canvas.height,
                vec3.fromValues(position.x, position.y, position.z),
                vec3.fromValues(rotation.x, rotation.y, rotation.z),
                vec3.fromValues(scale.x, scale.y, scale.z)
            );


            that.device.queue.writeBuffer(
                mvpMatrix,
                0,
                transformationMatrix.buffer,
                transformationMatrix.byteOffset,
                transformationMatrix.byteLength
            );

            const commandEncoder = that.device.createCommandEncoder();
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
            
            vertexBufferList.forEach((url, index) => {
                passEncoder.setPipeline(pipeline);
                passEncoder.setBindGroup(0, bindGroupList[index]);
                passEncoder.setVertexBuffer(0, vertexBufferList[index]);
                

                passEncoder.draw(that.obj.vertices[index].vertexCount, 1, 0, 0);
            })

            passEncoder.end();
            that.device.queue.submit([commandEncoder.finish()]);
        }
    }
}