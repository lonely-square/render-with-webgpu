import { mtlCongfig, objConfig, renderObj_ } from "./interface";
import { Mtl } from "./mtl";
import { ObjMesh } from "./objMesh";

export class renderObj implements renderObj_ {
    mtlName: string
    vertex: Float32Array
    vertexCount: number
    mtlConfig: mtlCongfig
    objConfig:objConfig

    constructor(mtlName: string,
        vertex: Float32Array,
        vertexCount: number,
        mtlConfig: mtlCongfig
    ) {
        this.mtlName = mtlName
        this.vertex = vertex
        this.vertexCount = vertexCount
        this.mtlConfig = mtlConfig
        this.objConfig = {
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
        }
    }

    static create(objMesh: ObjMesh, mtl: Mtl): renderObj[] {
        let that=this
        let res: renderObj[] = []
        objMesh.vertices.forEach(e => {
            let newRenderObj=new renderObj(e.mtlname, e.vertex, e.vertexCount, (mtl.mtl.get(e.mtlname) as mtlCongfig))
            renderObj.normalizeModelSize(newRenderObj,objMesh)
            res.push(newRenderObj)
        })
        return res
    }

    /**
     * 用于归一化模型大小
     * @param newRenderObj 待归一化模型
     * @param objMesh      初始图形数据，用来归一
     * @private
     */
    private static normalizeModelSize(newRenderObj: renderObj, objMesh:ObjMesh): void {
        newRenderObj.objConfig.scale.x/=objMesh.max
        newRenderObj.objConfig.scale.y/=objMesh.max
        newRenderObj.objConfig.scale.z/=objMesh.max
        
        newRenderObj.objConfig.position.y+=-objMesh.minY/objMesh.max
    }
}