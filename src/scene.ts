import { vec3 } from "gl-matrix";
import { sceneConfig } from "./interface";
import { select } from "./interface";
import { mtl } from "./mtl";
import { objMesh } from "./obj_mesh";
import { renderObj } from "./renderObj";

export abstract class scene implements select {
    protected device: GPUDevice
    protected canvas: HTMLCanvasElement
    protected sceneConfig: sceneConfig
    protected renderObjList: renderObj[]
    protected texUrl: string[]
    protected name: string
    protected static switchFlag: boolean

    public abstract switchScene(name: string): Promise<void>
    public abstract addCube(): Promise<void>;
    public abstract addlight(): void;

    /**
     * 创建一个场景实例
     * @param device WebGPU设备对象
     */
    constructor(device: GPUDevice, canvas: HTMLCanvasElement) {
        scene.switchFlag = false
        this.device = device
        this.canvas = canvas
        this.name = ""
        this.sceneConfig = {
            objConfig: {
                position: {
                    x: 0,
                    y: 0,
                    z: -1.5
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

    async init(modelUrl: string, mtlUrl: string, texUrl: string[]) {
        this.texUrl = texUrl
        let obj = new objMesh()
        let mtL = new mtl()
        this.sceneConfig = {
            objConfig: {
                position: {
                    x: 0,
                    y: 0,
                    z: -1.5
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
