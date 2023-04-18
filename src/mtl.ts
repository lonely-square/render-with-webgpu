import { vec3 } from "gl-matrix";
import { mtlCongfig } from "./interface";

export class mtl {

    mtl: Map<string,mtlCongfig>=new Map


    async initialize(url: string) {
        await this.readFile(url)
    }

    async readFile(url: string) {
        var result: number[] = [];

        const response: Response = await fetch(url)
        const blob: Blob = await response.blob()
        const fileContents = (await blob.text())
        const lines = fileContents.split("\n")
        let mtlTemp:any = {}
        let mtlName:string="" 

        lines.forEach(
            (line) => {
                if (line.slice(0, 6) == "newmtl") {
                    if (JSON.stringify(mtlTemp) != '{}') {
                        this.mtl.set(mtlName,mtlTemp);
                        result = [];
                    }
                    mtlName=line.split(" ")[1].replace(/\r/g, "")
                    mtlTemp= {}
                }
                else if (line.slice(0, 6) === "map_Kd") {
                    let url=line.split(" ")[1].split(/\/|\\\\/)
                    mtlTemp.map_Kd=url[url.length-1].replace(/\r/g, "")
                }
                else if (line.slice(0, 6) === "map_Ks") {
                    let url=line.split(" ")[1].split(/\/|\\\\/)
                    mtlTemp.map_Ks=url[url.length-1].replace(/\r/g, "")
                }
                else if (line.slice(0, 8) == "map_Bump") {
                    let url=line.split(" ")[1].split(/\/|\\\\/)
                    mtlTemp.map_Bump=url[url.length-1].replace(/\r/g, "")
                }
                else if (line.slice(0, 5) == "map_d") {
                    let url=line.split(" ")[1].split(/\/|\\\\/)
                    mtlTemp.map_d=url[url.length-1].replace(/\r/g, "")
                }
                else if (line.slice(0, 2) === "Ns") {
                    let temp=Number( line.split(" ")[1] )
                    mtlTemp.Ns=temp
                }
                else if (line.slice(0, 1) === "d") {
                    let temp=Number( line.split(" ")[1] )
                    mtlTemp.d=temp
                }
                else if (line.slice(0, 2) === "Ni") {
                    let temp=Number( line.split(" ")[1] )
                    mtlTemp.Ni=temp
                }
                else if (line.slice(0, 5) === "illum") {
                    let temp=Number( line.split(" ")[1] )
                    mtlTemp.illum=temp
                }
                else if (line.slice(0, 2) === "Ka") {
                    let temp=line.split(" ")
                    let comp:vec3 =[
                        Number(temp[1]),
                        Number(temp[2]),
                        Number(temp[3])
                    ]
                    mtlTemp.Ka=comp
                }
                else if (line.slice(0, 2) === "Kd") {
                    let temp=line.split(" ")
                    let comp:vec3 =[
                        Number(temp[1]),
                        Number(temp[2]),
                        Number(temp[3])
                    ]
                    mtlTemp.Kd=comp
                }
                else if (line.slice(0, 2) === "Ks") {
                    let temp=line.split(" ")
                    let comp:vec3 =[
                        Number(temp[1]),
                        Number(temp[2]),
                        Number(temp[3])
                    ]
                    mtlTemp.Ks=comp
                }
                else if (line.slice(0, 2) === "Ke") {
                    let temp=line.split(" ")
                    let comp:vec3 =[
                        Number(temp[1]),
                        Number(temp[2]),
                        Number(temp[3])
                    ]
                    mtlTemp.Ke=comp
                }
                
            }
        )
        this.mtl.set(mtlName,mtlTemp)


    }

}