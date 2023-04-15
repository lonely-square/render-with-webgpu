import { type } from "os"

//功能接口
export interface select{
    switchScene(name:string):Promise<void>
}



//场景参数
export type sceneConfig={
    objConfig:objConfig
    cameraConfig:cameraConfig
    lightConfig:lightConfig

}


type cameraConfig={
    position:coords,
}

type lightConfig={
    position:coords,
}

//其他
export interface coords {
    x: number,
    y: number,
    z: number
}

//控制物体
export interface objConfig {
    position: coords,
    rotation: coords,
    scale: coords
}

