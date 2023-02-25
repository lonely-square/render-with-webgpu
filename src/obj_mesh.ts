import { vec2,vec3} from 'gl-matrix'

export class objMesh {


    v: vec3[]
    vt: vec2[]
    vn: vec3[]
    vertices: Float32Array
    vertexCount: number 

    constructor(){
        
        this.v=[]
        this.vn=[]
        this.vt=[]  
        this.vertices = new Float32Array()
        this.vertexCount = 0
    }

    async initialize(url: string){  
        await this.readFile(url)        
        this.vertexCount = this.vertices.length /5   //因为坐标3加上贴图2 
        console.log(this.vertexCount)    
    }

    async readFile(url: string){
        var result: number[] = [];

        const response: Response = await fetch(url)
        const blob: Blob = await response.blob()
        const fileContents = (await blob.text())
        const lines = fileContents.split("\n")

        lines.forEach(
            (line) => {
                if (line[0] == "v" && line[1] == " ") {
                    this.read_vertex_data(line);
                }
                else if (line[0] == "v" && line[1] == "t") {
                    this.read_texcoord_data(line);
                }
                else if (line[0] == "v" && line[1] == "n") {
                    this.read_normal_data(line);
                }
                else if (line[0] == "f") {
                    this.read_face_data(line, result);
                }
            }
        )

        this.vertices = new Float32Array(result)
    }

    read_vertex_data(line: string) {

        const components = line.split(" ");
        // ["v", "x", "y", "z"]
        const new_vertex: vec3 = [
            Number(components[1]).valueOf(),
            Number(components[2]).valueOf(),
            Number(components[3]).valueOf()
        ];

        this.v.push(new_vertex);
    }

    read_texcoord_data(line: string) {

        const components = line.split(" ");
        // ["vt", "u", "v"]
        const new_texcoord: vec2 = [
            Number(components[1]).valueOf(),
            Number(components[2]).valueOf()
        ];

        this.vt.push(new_texcoord);
    }

    read_normal_data(line: string) {

        const components = line.split(" ");
        // ["vn", "nx", "ny", "nz"]
        const new_normal: vec3 = [
            Number(components[1]).valueOf(),
            Number(components[2]).valueOf(),
            Number(components[3]).valueOf()
        ];

        this.vn.push(new_normal);
    }

    read_face_data(line: string, result: number[]) {

        line = line.replace("\n", "");
        const vertex_descriptions = line.split(" ");
        // ["f", "v1", "v2", ...]
        /*
            triangle fan setup, eg.
            v1 v2 v3 v4 => (v1, v2, v3), (v1, v3, v4)
            no. of triangles = no. of vertices - 2
        */

       const triangle_count = vertex_descriptions.length - 3; // accounting also for "f"
       for (var i = 0; i < triangle_count; i++) {
            //corner a
            this.read_corner(vertex_descriptions[1], result);
            this.read_corner(vertex_descriptions[2 + i], result);
            this.read_corner(vertex_descriptions[3 + i], result);
       }
    }

    read_corner(vertex_description: string, result: number[]) {
        const v_vt_vn = vertex_description.split("/");
        const v = this.v[Number(v_vt_vn[0]).valueOf() - 1];
        const vt = this.vt[Number(v_vt_vn[1]).valueOf() - 1];
        //ignoring normals for now
        result.push(v[0]);
        result.push(v[1]);
        result.push(v[2]);
        result.push(vt[0]);
        result.push(vt[1]);
    }
}
