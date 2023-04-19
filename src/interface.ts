
//功能接口
export interface select {
    switchScene(name: string): Promise<void>
}



//场景参数
export type sceneConfig = {
    objConfig: objConfig
    cameraConfig: cameraConfig
    lightConfig: lightConfig

}


type cameraConfig = {
    position: coords
    rotation: coords
}

type lightConfig = {
    pattern: "全局光照" | "平行光" | "点光源"
    position: coords
}

//其他
export type coords = {
    x: number
    y: number
    z: number
}

//控制物体
export type objConfig = {
    position: coords
    rotation: coords
    scale: coords
}

//材质
export type mtlCongfig = {
    /** 
    *漫反射贴图，用于实现物体纹理。
    */
    map_Kd: string,
    /**
     * 法线贴图
     */
    map_Bump?: string,
    /**
     * /高光反射贴图，用于增强物体反光效果。
     */
    map_Ks?: string
    map_d?: string
    /**
     * 高光反射指数，一般在0-1000之间，数值越大则高光越集中，反之越模糊。
     */
    Ns: number
    /**
     * 环境光反射系数
     */
    Ka: number[]
    /**
     * 漫反射系数
     */
    Kd: number[]
    /**
     * 高光反射系数,物体在高光反射时的颜色。它的值是一个 RGB 颜色值，用来指定物体在高光反射处的颜色。
     */
    Ks: number[]
    /**
     * 物体的自发光颜色。这个值也是一个 RGB 颜色值，用于指定物体在无外界光照的情况下，自己所具有的发光颜色。
     */
    Ke: number[]
    /**
     * 物体的折射率。这个值表示了物体传播光线时的速度，值越大表示光线传播的速度越快，折射的强度就越弱，物体就会显得更加透明。
     */
    Ni: number
    /**
     * 物体的透明度，通常在0到1之间，数值越小则越透明。
    */
    d: number
    /**
     * 材质的光照模式。这个值表示了模型所使用的光照模式，比如常见的有“平面照明”、“高光照明”、“镜面反射”等模式。
     */
    illum:number
}

