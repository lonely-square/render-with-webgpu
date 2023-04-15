export class mtl {

    mtl: Map<string,  {
        map_Kd: string,
        map_Bump?: string,
        map_Ks?: string
    }>=new Map


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
                    mtlName=line.split(" ")[1]
                    mtlTemp= {}
                }
                else if (line.slice(0, 6) == "map_Kd") {
                    let url=line.split(" ")[1].split(/\/|\\\\/)
                    mtlTemp.map_Kd=url[url.length-1]
                }
            }
        )
        this.mtl.set(mtlName,mtlTemp)


    }

}