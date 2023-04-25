import { mtlCongfig, renderObj_ } from "./interface";
import { mtl } from "./mtl";
import { objMesh } from "./obj_mesh";

export class renderObj implements renderObj_ {
    mtlname: string
    vertex: Float32Array
    vertexCount: number
    mtlConfig: mtlCongfig

    constructor(mtlname: string,
        vertex: Float32Array,
        vertexCount: number,
        mtlConfig: mtlCongfig
    ) {
        this.mtlname = mtlname
        this.vertex = vertex
        this.vertexCount = vertexCount
        this.mtlConfig = mtlConfig
    }

    static create(objMesh: objMesh, mtl: mtl): renderObj[] {
        let res: renderObj[] = []
        objMesh.vertices.forEach(e => {
            res.push(new renderObj(e.mtlname, e.vertex, e.vertexCount, (mtl.mtl.get(e.mtlname) as mtlCongfig)))
        })
        return res
    }
}