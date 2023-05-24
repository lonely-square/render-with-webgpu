import { vec3 } from "gl-matrix";
import { sceneConfig } from "./interface";
import { select } from "./interface";
import { Mtl } from "./mtl";
import { ObjMesh } from "./objMesh";
import { renderObj } from "./renderObj";

export abstract class scene implements select {
    protected device: GPUDevice
    protected canvas: HTMLCanvasElement
    protected sceneConfig: sceneConfig
    protected renderObjList: renderObj[]
    protected texUrl: {name:string,url:string}[]
    public name: string
    protected static switchFlag: boolean

    public abstract switchScene(name: string): Promise<void>

    /**
     * 创建一个场景实例
     * @param device WebGPU设备对象
     */
    constructor(device: GPUDevice, canvas: HTMLCanvasElement) {
        this.device = device
        this.canvas = canvas
        this.name = ""
        this.sceneConfig = {
            objConfig: {
                position: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 1
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                }
            },
            cameraConfig: {
                position: {
                    x: 0,
                    y: 1.84,
                    z: 2.2
                },
                rotation: {
                    x: -0.4,
                    y: 0,
                    z: 0
                }
            },
            lightConfig: [
                {
                    pattern: "平行光",
                    color: [255.0, 255.0, 255.0],
                    type: 1,
                    position: {
                        x: 0.5,
                        y: 0.5,
                        z: 100
                    }
                }
            ]
        }
        this.renderObjList = []
        this.texUrl = []
    }

    async init(modelUrl: string, mtlUrl: string, texUrl: {name:string,url:string}[]) {
        this.texUrl = texUrl
        let obj = new ObjMesh()
        let mtL = new Mtl()
        this.sceneConfig = {
            objConfig: {
                position: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 1
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                }
            },
            cameraConfig: {
                position: {
                    x: 0,
                    y: 1.84,
                    z: 2.2
                },
                rotation: {
                    x: -0.4,
                    y: 0,
                    z: 0
                }
            },
            lightConfig: [
                {
                    pattern: "平行光",
                    color: [255.0, 255.0, 255.0],
                    type: 1,
                    position: {
                        x: 31.5,
                        y: 45.5,
                        z: 100
                    }
                }
            ]
        }
        await obj.initialize(modelUrl)
        await mtL.initialize(mtlUrl)
        this.renderObjList = renderObj.create(obj, mtL)

    }

}
