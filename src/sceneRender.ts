import { scene } from "./scene";
import { getTransformationMatrix } from './matrix'
import vertexShader from './shader/vertex_01.wgsl';
import fragmentShader_Kd_Ks_bump from './shader/fragment_Kd_Ks_Bump.wgsl';
import fragmentShader_Kd from './shader/fragment_Kd.wgsl';
import fragmentShader_Kd_d from './shader/fragment_Kd_d.wgsl';
import fragmentShader_Kd_Ks_bump_d from './shader/fragment_Kd_Ks_Bump_d.wgsl';
import fragmentShader from './shader/fragment.wgsl'
import { mtlCongfig } from "./interface";
import { renderObj } from "./renderObj";



export abstract class sceneRender extends scene {

    private vertexBufferList: GPUBuffer[] = []
    private Map_kd_list: GPUTexture[] = []
    private Map_Bump_list: GPUTexture[] = []
    private Map_ks_list: GPUTexture[] = []
    private bindGroupList: GPUBindGroup[] = []
    private context: GPUCanvasContext | null = null
    private mvpMatrix: GPUBuffer | null = null
    private modelMatrix: GPUBuffer | null = null
    private rotationMatrix: GPUBuffer | null = null
    private depthTexture: GPUTexture | null = null
    private pipeline: GPURenderPipeline[] = []
    private lightConfig: GPUBuffer | null = null
    private cameraPos: GPUBuffer | null = null
    private piplineGroupLayout: GPUBindGroupLayout | null = null
    private presentationFormat: GPUTextureFormat | null = null
    private texConfigList: GPUBuffer[] = []
    private Map_d_list: GPUTexture[] = []


    abstract switchScene(name: string): Promise<void>
    public abstract addCube(): Promise<void>;
    public abstract addlight(): void;

    init(modelUrl: string, mtlUrl: string, texUrl: string[]): Promise<void> {
        this.vertexBufferList = []
        this.Map_kd_list = []
        this.Map_Bump_list = []
        this.Map_ks_list = []
        this.bindGroupList = []
        this.texConfigList = []
        this.Map_d_list = []
        this.pipeline = []
        return super.init(modelUrl, mtlUrl, texUrl)
    }
    /**
  * 渲染场景
  */
    protected async render() {
        this.vertexBufferList = []
        this.Map_kd_list = []
        this.Map_Bump_list = []
        this.Map_ks_list = []
        this.bindGroupList = []
        this.texConfigList = []
        this.Map_d_list = []
        this.pipeline = []
        await this.prepareResource()
        await this.webGPURender()
    }

    private async prepareResource() {
        let that = this

        that.context = that.canvas.getContext('webgpu') as unknown as GPUCanvasContext;

        //设置BindGroupLayout
        that.piplineGroupLayout = that.device.createBindGroupLayout({
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
                    buffer: { type: 'read-only-storage' }
                },
                {
                    binding: 6,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: { type: 'uniform' }
                },
                {
                    binding: 7,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: { type: 'uniform' }
                },
                {
                    binding: 8,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: { type: 'uniform' }
                },
                {
                    binding: 9,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: "float"
                    }
                },
                {
                    binding: 10,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: 'uniform' }
                },
            ]

        });


        that.presentationFormat = navigator.gpu.getPreferredCanvasFormat();

        that.context.configure({
            device: that.device,
            format: that.presentationFormat as GPUTextureFormat,
            alphaMode: 'opaque',
        });



        //设置深度信息
        that.depthTexture = that.device.createTexture({
            size: [that.canvas.width, that.canvas.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });

        //贴图，顶点数据放入缓存
        for (let renderObj of that.renderObjList) {
            //贴图数据
            const texture_Kd = new Image()

            texture_Kd.src = that.texUrl.filter(url => {
                if (renderObj.mtlConfig.map_Kd) {
                    return url.includes(renderObj.mtlConfig.map_Kd)
                } else {
                    return './model/tip.jpg'
                }
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
                if (renderObj.mtlConfig.map_Ks) {
                    return url.includes(renderObj.mtlConfig.map_Ks)
                } else {
                    return './model/tip.jpg'
                }
            })[0]

            if (!renderObj.mtlConfig.map_Ks) {
                that.Map_ks_list.push(cubeTexture)
            } else {

                await texture_Ks.decode()
                const imageBitmap2 = await createImageBitmap(texture_Ks);
                const cubeTexture2 = that.device.createTexture({
                    size: [imageBitmap2.width, imageBitmap2.height, 1],
                    format: 'rgba8unorm',
                    usage:
                        GPUTextureUsage.TEXTURE_BINDING |
                        GPUTextureUsage.COPY_DST |
                        GPUTextureUsage.RENDER_ATTACHMENT,
                });
                that.device.queue.copyExternalImageToTexture(
                    { source: imageBitmap2 },
                    { texture: cubeTexture2 },
                    [imageBitmap2.width, imageBitmap2.height]
                );
                that.Map_ks_list.push(cubeTexture2)
            }


            const texture_Bump = new Image()
            texture_Bump.src = that.texUrl.filter(url => {
                if (renderObj.mtlConfig.map_Bump) {
                    return url.includes(renderObj.mtlConfig.map_Bump)
                } else {
                    return './model/tip.jpg'
                }
            })[0]

            if (!renderObj.mtlConfig.map_Bump) {
                that.Map_Bump_list.push(cubeTexture)
            } else {
                await texture_Bump.decode()
                const imageBitmap3 = await createImageBitmap(texture_Bump);
                const cubeTexture3 = that.device.createTexture({
                    size: [imageBitmap3.width, imageBitmap3.height, 1],
                    format: 'rgba8unorm',
                    usage:
                        GPUTextureUsage.TEXTURE_BINDING |
                        GPUTextureUsage.COPY_DST |
                        GPUTextureUsage.RENDER_ATTACHMENT,
                });
                that.device.queue.copyExternalImageToTexture(
                    { source: imageBitmap3 },
                    { texture: cubeTexture3 },
                    [imageBitmap3.width, imageBitmap3.height]
                );
                that.Map_Bump_list.push(cubeTexture3)
            }

            const texture_d = new Image()
            texture_d.src = that.texUrl.filter(url => {
                if (renderObj.mtlConfig.map_d) {
                    return url.includes(renderObj.mtlConfig.map_d)
                } else {
                    return './model/tip.jpg'
                }
            })[0]

            if (!renderObj.mtlConfig.map_d) {
                that.Map_d_list.push(cubeTexture)
            } else {

                await texture_d.decode()

                const imageBitmap4 = await createImageBitmap(texture_d);

                const cubeTexture4 = that.device.createTexture({
                    size: [imageBitmap4.width, imageBitmap4.height, 1],
                    format: 'rgba8unorm',
                    usage:
                        GPUTextureUsage.TEXTURE_BINDING |
                        GPUTextureUsage.COPY_DST |
                        GPUTextureUsage.RENDER_ATTACHMENT,
                });
                that.device.queue.copyExternalImageToTexture(
                    { source: imageBitmap4 },
                    { texture: cubeTexture4 },
                    [imageBitmap4.width, imageBitmap4.height]
                );
                that.Map_d_list.push(cubeTexture4)

            }

            //贴图设置
            const texConfig = that.device.createBuffer({
                size: 4 * 20,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });
            let temp = [
                renderObj.mtlConfig.Ns,
                renderObj.mtlConfig.Ni,
                renderObj.mtlConfig.d,
                renderObj.mtlConfig.illum,
                renderObj.mtlConfig.Ka[0],
                renderObj.mtlConfig.Ka[1],
                renderObj.mtlConfig.Ka[2],
                0,
                renderObj.mtlConfig.Kd[0],
                renderObj.mtlConfig.Kd[1],
                renderObj.mtlConfig.Kd[2],
                0,
                renderObj.mtlConfig.Ks[0],
                renderObj.mtlConfig.Ks[1],
                renderObj.mtlConfig.Ks[2],
                0,
                renderObj.mtlConfig.Ke[0],
                renderObj.mtlConfig.Ke[1],
                renderObj.mtlConfig.Ke[2],
                0,
            ]
            let array2 = new Float32Array(temp)
            that.device.queue.writeBuffer(
                texConfig,
                0,
                array2.buffer,
                array2.byteOffset,
                array2.byteLength
            );

            that.texConfigList.push(texConfig)
            //顶点数据

            const vertexBufferDescriptor: GPUBufferDescriptor = {
                size: renderObj.vertex.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
                mappedAtCreation: true
            };
            const buffer = that.device.createBuffer(vertexBufferDescriptor);
            new Float32Array(buffer.getMappedRange())
                .set(renderObj.vertex);
            buffer.unmap();
            that.vertexBufferList.push(buffer);


            //设置渲染管线

            that.pipeline.push(this.prePipline(renderObj))
        }


        //设置mvp缓存
        that.mvpMatrix = that.device.createBuffer({
            size: 4 * 4 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        that.modelMatrix = that.device.createBuffer({
            size: 4 * 4 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        that.rotationMatrix = that.device.createBuffer({
            size: 4 * 4 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        //光线方面
        that.lightConfig = that.device.createBuffer({
            size: 4 * 16 * 10,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });

        that.cameraPos = that.device.createBuffer({
            size: 4 * 3,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });




        //设置采样器
        const sampler = that.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
        });

        //把所有资源打包进bindgroup
        that.renderObjList.forEach((renderObj, index) => {
            const uniformBindGroup = that.device.createBindGroup({
                layout: that.pipeline[index].getBindGroupLayout(0),
                entries: [
                    {
                        binding: 0,
                        resource: {
                            buffer: that.mvpMatrix as GPUBuffer,
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
                            buffer: that.lightConfig as GPUBuffer,
                        }
                    },
                    {
                        binding: 6,
                        resource: {
                            buffer: that.rotationMatrix as GPUBuffer,
                        }
                    },
                    {
                        binding: 7,
                        resource: {
                            buffer: that.cameraPos as GPUBuffer,
                        }
                    },
                    {
                        binding: 8,
                        resource: {
                            buffer: that.texConfigList[index],
                        }
                    },
                    {
                        binding: 9,
                        resource: that.Map_d_list[index].createView(),
                    },
                    {
                        binding: 10,
                        resource: {
                            buffer: that.modelMatrix as GPUBuffer,
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
            if (scene.switchFlag === true) {
                return
            }
            draw();
            requestAnimationFrame(frame);
        }

        function draw() {

            const [transformationMatrix, rotationMatrix, modelMatrix] = getTransformationMatrix(that.canvas.width / that.canvas.height, that.sceneConfig);

            let res: number[] = [that.sceneConfig.lightConfig.length, 0, 0, 0]
            for (let i = 0; i < that.sceneConfig.lightConfig.length; i++) {
                res = [...res, that.sceneConfig.lightConfig[i].type, 0, 0, 0, ...that.sceneConfig.lightConfig[i].color, 0, that.sceneConfig.lightConfig[i].position.x, that.sceneConfig.lightConfig[i].position.y, that.sceneConfig.lightConfig[i].position.z, 0]
            }
            let res_ = new Float32Array(res)

            that.device.queue.writeBuffer(
                that.lightConfig as GPUBuffer,
                0,
                res_.buffer,
                res_.byteOffset,
                res_.byteLength
            );

            let temp = [
                that.sceneConfig.cameraConfig.position.x,
                that.sceneConfig.cameraConfig.position.y,
                that.sceneConfig.cameraConfig.position.z
            ]
            let array2 = new Float32Array(temp)
            that.device.queue.writeBuffer(
                that.cameraPos as GPUBuffer,
                0,
                array2.buffer,
                array2.byteOffset,
                array2.byteLength
            );


            that.device.queue.writeBuffer(
                that.mvpMatrix as GPUBuffer,
                0,
                transformationMatrix.buffer,
                transformationMatrix.byteOffset,
                transformationMatrix.byteLength
            );

            that.device.queue.writeBuffer(
                that.modelMatrix as GPUBuffer,
                0,
                modelMatrix.buffer,
                modelMatrix.byteOffset,
                modelMatrix.byteLength
            );

            that.device.queue.writeBuffer(
                that.rotationMatrix as GPUBuffer,
                0,
                rotationMatrix.buffer,
                rotationMatrix.byteOffset,
                rotationMatrix.byteLength
            );

            const commandEncoder = that.device.createCommandEncoder();
            const textureView = (that.context as GPUCanvasContext).getCurrentTexture().createView();

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
                    view: (that.depthTexture as GPUTexture).createView(),
                    depthClearValue: 1.0,
                    depthLoadOp: 'clear',
                    depthStoreOp: 'store',
                },
            };

            const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

            that.renderObjList.forEach((url, index) => {
                passEncoder.setPipeline(that.pipeline[index]);
                passEncoder.setBindGroup(0, that.bindGroupList[index]);
                passEncoder.setVertexBuffer(0, that.vertexBufferList[index]);
                passEncoder.draw(that.renderObjList[index].vertexCount, 1, 0, 0);
            })

            passEncoder.end();
            that.device.queue.submit([commandEncoder.finish()]);
        }
    }

    private prePipline(renderObj: renderObj) {
        let that = this
        let res: GPURenderPipeline

        const blendState: GPUBlendState = {
            color: {
                srcFactor: "src-alpha",
                dstFactor: "one-minus-src-alpha",
                operation: "add"
            },
            alpha: {
                srcFactor: "src-alpha",
                dstFactor: "one-minus-src-alpha",
                operation: "add"
            }
        };

        if (renderObj.mtlConfig.map_d &&
            renderObj.mtlConfig.map_Bump &&
            renderObj.mtlConfig.map_Kd &&
            renderObj.mtlConfig.map_Ks
        ) {
            const blendState1: GPUBlendState = {
                color: {
                    srcFactor: "src-alpha",
                    dstFactor: "one-minus-src-alpha",
                    operation: "add"
                },
                alpha: {
                    srcFactor: "one-minus-src-alpha",
                    dstFactor: "src-alpha",
                    operation: "add"
                }
            };

            res = that.device.createRenderPipeline({
                layout: that.device.createPipelineLayout({ bindGroupLayouts: [that.piplineGroupLayout as GPUBindGroupLayout] }),
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
                        code: fragmentShader_Kd_Ks_bump_d,
                    }),
                    entryPoint: 'main',
                    targets: [
                        {
                            format: that.presentationFormat as GPUTextureFormat,
                            // blend:blendState1
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
        }
        else if (renderObj.mtlConfig.map_d &&
            renderObj.mtlConfig.map_Kd
        ) {
            const blendState2: GPUBlendState = {
                color: {
                    srcFactor: "src-alpha",
                    dstFactor: "one-minus-src-alpha",
                    operation: "add"
                },
                alpha: {
                    srcFactor: "src-alpha",
                    dstFactor: "one-minus-src-alpha",
                    operation: "add"
                }
            };

            res = that.device.createRenderPipeline({
                layout: that.device.createPipelineLayout({ bindGroupLayouts: [that.piplineGroupLayout as GPUBindGroupLayout] }),
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
                        code: fragmentShader_Kd_d,
                    }),
                    entryPoint: 'main',
                    targets: [
                        {
                            format: that.presentationFormat as GPUTextureFormat,
                            blend: blendState2
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
        }
        else if (renderObj.mtlConfig.map_Bump &&
            renderObj.mtlConfig.map_Kd &&
            renderObj.mtlConfig.map_Ks
        ) {

            res = that.device.createRenderPipeline({
                layout: that.device.createPipelineLayout({ bindGroupLayouts: [that.piplineGroupLayout as GPUBindGroupLayout] }),
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
                        code: fragmentShader_Kd_Ks_bump,
                    }),
                    entryPoint: 'main',
                    targets: [
                        {
                            format: that.presentationFormat as GPUTextureFormat,
                            blend: blendState
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
        }
        else if (
            renderObj.mtlConfig.map_Kd
        ) {
            res = that.device.createRenderPipeline({
                layout: that.device.createPipelineLayout({ bindGroupLayouts: [that.piplineGroupLayout as GPUBindGroupLayout] }),
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
                        code: fragmentShader_Kd,
                    }),
                    entryPoint: 'main',
                    targets: [
                        {
                            format: that.presentationFormat as GPUTextureFormat,
                            blend: blendState
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
        }
        else {
            res = that.device.createRenderPipeline({
                layout: that.device.createPipelineLayout({ bindGroupLayouts: [that.piplineGroupLayout as GPUBindGroupLayout] }),
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
                            format: that.presentationFormat as GPUTextureFormat,
                            blend: blendState
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
        }

        return res;
    }
}

