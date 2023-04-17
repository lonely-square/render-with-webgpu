import { scene } from "./scene";
import { getTransformationMatrix } from './matrix'
import vertexShader from './shader/vertex_01.wgsl';
import fragmentShader from './shader/fragment_01.wgsl';
import { coords } from "./interface";
import { vec3 } from 'gl-matrix';
import { freemem } from "os";


export abstract class sceneRender extends scene {

    private vertexBufferList: GPUBuffer[] = []
    private Map_kd_list: GPUTexture[] = []
    private Map_Bump_list: GPUTexture[] = []
    private Map_ks_list: GPUTexture[] = []
    private bindGroupList: GPUBindGroup[] = []
    private context:any 
    private mvpMatrix:any
    private depthTexture:any
    private pipeline:any
    private lightVector:any

    abstract switchScene(name: string): Promise<void>

    init(modelUrl: string, mtlUrl: string, texUrl: string[]): Promise<void> {
        this.vertexBufferList = []
        this.Map_kd_list=[]
        this.Map_Bump_list= []
        this.Map_ks_list = []
        this.bindGroupList = []
        return super.init(modelUrl,mtlUrl,texUrl)
    }
    /**
  * 渲染场景
  */
    protected async render() {
        
        await this.prepareResource()
        await this.webGPURender()
    }

    private async prepareResource() {
        let that = this

        that.context = that.canvas.getContext('webgpu') as unknown as GPUCanvasContext;

        //贴图，顶点数据放入缓存
        let count = 0;
        for (let vertices of that.obj.vertices) {
            //贴图数据
            const texture_Kd = new Image()
            texture_Kd.src = that.texUrl.filter(url => {
                return url.includes((that.mtl.mtl.get(vertices.mtlname) as any).map_Kd)
            })[0]
            await texture_Kd.decode()
            let imageBitmap = await createImageBitmap(texture_Kd);
            let cubeTexture = that.device.createTexture({
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
            that.Map_kd_list.push(cubeTexture)


            
            const texture_Ks = new Image()
            texture_Ks.src = that.texUrl.filter(url => {
                return url.includes((that.mtl.mtl.get(vertices.mtlname) as any).map_Kd)
            })[0]
            await texture_Ks.decode()
            imageBitmap = await createImageBitmap(texture_Ks);
            cubeTexture = that.device.createTexture({
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
            that.Map_ks_list.push(cubeTexture)

            const texture_Bump = new Image()
            texture_Bump.src = that.texUrl.filter(url => {
                return url.includes((that.mtl.mtl.get(vertices.mtlname) as any).map_Kd)
            })[0]
            await texture_Bump.decode()
            imageBitmap = await createImageBitmap(texture_Bump);
            cubeTexture = that.device.createTexture({
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
            that.Map_Bump_list.push(cubeTexture)

            //顶点数据
            console.log(that.obj.vertices,that.obj.vertices[count].vertex.byteLength)
            const vertexBufferDescriptor: GPUBufferDescriptor = {
                size: that.obj.vertices[count].vertex.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
                mappedAtCreation: true
            };
            const buffer = that.device.createBuffer(vertexBufferDescriptor);
            new Float32Array(buffer.getMappedRange())
                .set(that.obj.vertices[count].vertex);
            buffer.unmap();
            that.vertexBufferList.push(buffer);

            count++
        }

        const devicePixelRatio = window.devicePixelRatio || 1;
        that.canvas.width = that.canvas.clientWidth * devicePixelRatio;
        that.canvas.height = that.canvas.clientHeight * devicePixelRatio;
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

        that.context.configure({
            device: that.device,
            format: presentationFormat,
            alphaMode: 'opaque',
        });


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
                {
                    binding: 3,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: "float"
                    }
                },
                {
                    binding: 4,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: "float"
                    }
                },
                {
                    binding: 5,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: { type: 'uniform' }
                },
            ]

        });

        //设置深度信息
        that.depthTexture = that.device.createTexture({
            size: [that.canvas.width, that.canvas.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });

        //设置渲染管线
        that.pipeline = that.device.createRenderPipeline({
            layout: that.device.createPipelineLayout({ bindGroupLayouts: [piplineGroupLayout] }),
            vertex: {
                module: that.device.createShaderModule({
                    code: vertexShader
                }),
                entryPoint: "main",
                buffers: [
                    {
                        arrayStride: 32,
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
                            },
                            {
                                shaderLocation: 2,
                                format: "float32x3",
                                offset: 20
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
        that.mvpMatrix = that.device.createBuffer({
            size: 4 * 4 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        //光线方面
        that.lightVector= that.device.createBuffer({
            size: 4 * 3,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        let direction:vec3 = [0,0,0]
        let temp:vec3 =[
            that.sceneConfig.lightConfig.position.x,
            that.sceneConfig.lightConfig.position.y,
            that.sceneConfig.lightConfig.position.z
        ]
        vec3.subtract(direction,direction,temp)
        vec3.divide(direction,direction,[vec3.length(direction),vec3.length(direction),vec3.length(direction)])
        let array1=new Float32Array(direction)
        that.device.queue.writeBuffer(
            that.lightVector,
            0,
            array1.buffer,
            array1.byteOffset,
            array1.byteLength
        );

        //设置采样器
        const sampler = that.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
        });

        //把所有资源打包进bindgroup
        that.obj.vertices.forEach((objConfig, index) => {
            const uniformBindGroup = that.device.createBindGroup({
                layout: that.pipeline.getBindGroupLayout(0),
                entries: [
                    {
                        binding: 0,
                        resource: {
                            buffer: that.mvpMatrix,
                        }
                    },
                    {
                        binding: 1,
                        resource: sampler,
                    },
                    {
                        binding: 2,
                        resource: that.Map_kd_list[index].createView(),
                    },
                    {
                        binding: 3,
                        resource: that.Map_Bump_list[index].createView(),
                    },
                    {
                        binding: 4,
                        resource: that.Map_ks_list[index].createView(),
                    },
                    {
                        binding: 5,
                        resource: {
                            buffer: that.lightVector,
                        }
                    },
                ],
            });

            that.bindGroupList.push(uniformBindGroup);

        })
    }

    private async webGPURender() {
        let that = this
    
        scene.switchFlag = false

        requestAnimationFrame(frame);
        function frame() {
            // that.sceneConfig.objConfig.rotation.x += 0.001;
            // that.sceneConfig.objConfig.rotation.y += 0.001;
            // that.sceneConfig.objConfig.rotation.z += 0.001;

 
            if (scene.switchFlag === true)  return


            draw();
            requestAnimationFrame(frame);
        }

        function draw() {

            const transformationMatrix = getTransformationMatrix(that.canvas.width / that.canvas.height,that.sceneConfig );


            that.device.queue.writeBuffer(
                that.mvpMatrix,
                0,
                transformationMatrix.buffer,
                transformationMatrix.byteOffset,
                transformationMatrix.byteLength
            );

            const commandEncoder = that.device.createCommandEncoder();
            const textureView = that.context.getCurrentTexture().createView();

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
                    view: that.depthTexture.createView(),
                    depthClearValue: 1.0,
                    depthLoadOp: 'clear',
                    depthStoreOp: 'store',
                },
            };

            const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
            
            that.vertexBufferList.forEach((url, index) => {
                passEncoder.setPipeline(that.pipeline);
                passEncoder.setBindGroup(0, that.bindGroupList[index]);
                passEncoder.setVertexBuffer(0, that.vertexBufferList[index]);
                passEncoder.draw(that.obj.vertices[index].vertexCount, 1, 0, 0);
            })

            passEncoder.end();
            that.device.queue.submit([commandEncoder.finish()]);
        }
    }
}