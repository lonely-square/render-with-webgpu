import { mat4 } from "gl-matrix";
import { scene } from "./scene";
import { sceneRender } from "./sceneRender";
import { tools } from "./tools";
import * as dat from 'dat.gui';
import Stats from 'stats.js'
import { vec3 } from "gl-matrix";
import { lightConfig, mtlCongfig } from "./interface";
import { renderObj } from "./renderObj";

export class sceneGUI extends sceneRender {

    datGUi: dat.GUI
    stats: Stats

    constructor(device: GPUDevice, canvas: HTMLCanvasElement) {

        super(device, canvas)
        this.datGUi = new dat.GUI
        this.stats = new Stats

    }

    async switchScene(name: string): Promise<void> {

        this.name = name
        if (name === "lantern") {

            scene.switchFlag = true
            await this.init("./model/lantern/lantern.obj", "./model/lantern/灯笼.mtl", ["./model/lantern/tex/000001B95523DFF8.jpg", "./model/lantern/tex/000001B955240538.jpg"]);
            

        }
        if (name === "girl") {

            scene.switchFlag = true
            await this.init("./model/Bunny Girl/Bunny Girl.obj", "./model/Bunny Girl/Bunny Girl.mtl", [
                "./model/Bunny Girl/textures/S_9000_eyeshade_col.tga.png",
                "./model/Bunny Girl/textures/s_9000_FC_col.tga.png",
                "./model/Bunny Girl/textures/S_9000_FC_mask.tga.png",
                "./model/Bunny Girl/textures/s_9000_FC_nml.tga.png",
                "./model/Bunny Girl/textures/S_9000_HR_col2.tga.png",
                "./model/Bunny Girl/textures/S_9000_HR_mask.tga.png",
                "./model/Bunny Girl/textures/S_9000_HR_nml.tga.png",
                "./model/Bunny Girl/textures/S_9009_BD_col.tga.png",
                "./model/Bunny Girl/textures/S_9009_BD_mask.tga.png",
                "./model/Bunny Girl/textures/S_9009_BD_nml.tga.png",
                "./model/Bunny Girl/textures/S_9009_HD_col2.tga.png",
                "./model/Bunny Girl/textures/S_9009_HD_mask.tga.png",
                "./model/Bunny Girl/textures/S_9009_HD_nml.tga.png",
                "./model/Bunny Girl/textures/S_9009_PART_col.tga.png",
                "./model/Bunny Girl/textures/S_9009_PART_mask.tga.png",
                "./model/Bunny Girl/textures/S_9009_PART_nml.tga.png"
            ]);
            this.sceneConfig.objConfig.scale.x /= 200
            this.sceneConfig.objConfig.scale.y /= 200
            this.sceneConfig.objConfig.scale.z /= 200

    
           
            
        }
        // await this.render()
        await this.addskybox()
        this.initController()

    }

    public async addCube(): Promise<void> {
        scene.switchFlag = true

        // let vertex = new Float32Array([
        //     1, 1, -1,    0, 0, 0, 0, 1,
        //     1, -1, -1,    0, 0, 0, 0, 1,
        //     -1, -1, -1,    0, 0, 0, 0, 1,

        //     -1, -1, -1,    0, 0, 0, 0, 1,
        //     -1, 1, -1,    0, 0, 0, 0, 1,
        //     1, 1, -1,    0, 0, 0, 0, 1,
        // ])

        let vertex = new Float32Array([
            10, -0.8, 10,    0, 0, 0, 0, 1,
            10, -0.8, -10,    0, 0, 0, 0, 1,
            -10, -0.8, -10,    0, 0, 0, 0, 1,

            -10, -0.8, -10,    0, 0, 0, 0, 1,
            -10, -0.8, 10,    0, 0, 0, 0, 1,
            10,  -0.8, 10,     0, 0, 0, 0, 1,
        ])

        let mtlConfig: mtlCongfig = {
            Ns: 1000,
            Ka: [0.5, 0.5, 0.5],
            Kd: [0.8, 0, 0],
            Ks: [1, 1, 1],
            Ke: [0, 0, 0],
            Ni: 1.45,
            d: 1,
            illum: 1,
        }




        let e: renderObj = new renderObj("正方面", vertex, 6, mtlConfig)
        this.renderObjList.push(e)

        await this.render()
        
        this.initController()


    }

    public async addskybox(): Promise<void> {
        scene.switchFlag = true

        let vertex = new Float32Array([

            1000, -1000, 1000,   1, 0, 1,    1, 1,
            -1000, -1000, 1000,   0, 0, 1,   0, 1,
            -1000, -1000, -1000,   0, 0, 0,  0, 0,
            1000, -1000, -1000,   1, 0, 0,   1, 0,
            1000, -1000, 1000,   1, 0, 1,    1, 1,
            -1000, -1000, -1000,  0, 0, 0,   0, 0,

            1000, 1000, 1000,     1, 1, 1,   1, 1,
            1000, -1000, 1000,    1, 0, 1,    0, 1,
            1000, -1000, -1000,   1, 0, 0,    0, 0,
            1000, 1000, -1000,    1, 1, 0,    1, 0,
            1000, 1000, 1000,     1, 1, 1,    1, 1,
            1000, -1000, -1000,   1, 0, 0,    0, 0,

            -1000, 1000, 1000,    0, 1, 1,    1, 1,
            1000, 1000, 1000,     1, 1, 1,    0, 1,
            1000, 1000, -1000,    1, 1, 0,    0, 0,
            -1000, 1000, -1000,   0, 1, 0,    1, 0,
            -1000, 1000, 1000,    0, 1, 1,    1, 1,
            1000, 1000, -1000,    1, 1, 0,    0, 0,

            -1000, -1000, 1000,    0, 0, 1,   1, 1,
            -1000, 1000, 1000,     0, 1, 1,   0, 1,
            -1000, 1000, -1000,    0, 1, 0,   0, 0,
            -1000, -1000, -1000,   0, 0, 0,   1, 0,
            -1000, -1000, 1000,    0, 0, 1,   1, 1,
            -1000, 1000, -1000,    0, 1, 0,   0, 0,

            1000, 1000, 1000,     1, 1, 1,    1, 1,
            -1000, 1000, 1000,    0, 1, 1,    0, 1,
            -1000, -1000, 1000,   0, 0, 1,    0, 0,
            -1000, -1000, 1000,   0, 0, 1,    0, 0,
            1000, -1000, 1000,    1, 0, 1,    1, 0,
            1000, 1000, 1000,     1, 1, 1,    1, 1,

            1000, -1000, -1000,     1, 0, 0,    1, 1,
            -1000, -1000, -1000,    0, 0, 0,    0, 1,
            -1000, 1000, -1000,     0, 1, 0,    0, 0,
            1000, 1000, -1000,     1, 1, 0,    1, 0,
            1000, -1000, -1000,    1, 0, 0,    1, 1,
            -1000, 1000, -1000,    0, 1, 0,    0, 0,
        ])
        let mtlConfig: mtlCongfig = {
            Ns: 1000,
            Ka: [0.5, 0.5, 0.5],
            Kd: [0.8, 0, 0],
            Ks: [1, 1, 1],
            Ke: [0, 0, 0],
            Ni: 1.45,
            d: 1,
            illum: 1,
        }


        let e: renderObj = new renderObj("天空盒", vertex, 36, mtlConfig)
        this.renderObjList.unshift(e)

        await this.render()
        
        this.initController()


    }

    public addlight(): void {
        let e: lightConfig = {
            pattern: "平行光",
            color: [255.0, 255.0, 255.0],
            type: 1,
            position: {
                x: 0,
                y: 0,
                z: 100
            }
        }
        this.sceneConfig.lightConfig.push(e)
        this.initController()
    }

    private initController() {

        let that = this

        that.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        that.stats.showPanel(1);
        that.stats.showPanel(2);
        // that.stats.showPanel(3);
        // this.canvas.appendChild(that.stats.dom);
        document.body.appendChild(that.stats.dom);

        function animate() {

            that.stats.begin();

            // monitored code goes here

            that.stats.end();

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);

        that.datGUi.destroy()

        that.datGUi = new dat.GUI
        let folder_1 = that.datGUi.addFolder("transfrom")

        folder_1.open()
        let folder_1_1 = folder_1.addFolder("objPosition")
        folder_1_1.add(this.sceneConfig.objConfig.position as any, "x", undefined, undefined, 0.01)
        folder_1_1.add(this.sceneConfig.objConfig.position as any, "y", undefined, undefined, 0.01)
        folder_1_1.add(this.sceneConfig.objConfig.position as any, "z", undefined, undefined, 0.01)

        let folder_1_2 = folder_1.addFolder("objRotation")
        folder_1_2.add(this.sceneConfig.objConfig.rotation as any, "x", undefined, undefined, 0.01)
        folder_1_2.add(this.sceneConfig.objConfig.rotation as any, "y", undefined, undefined, 0.01)
        folder_1_2.add(this.sceneConfig.objConfig.rotation as any, "z", undefined, undefined, 0.01)

        let folder_1_3 = folder_1.addFolder("objScale")
        folder_1_3.add(this.sceneConfig.objConfig.scale as any, "x", undefined, undefined, 0.01)
        folder_1_3.add(this.sceneConfig.objConfig.scale as any, "y", undefined, undefined, 0.01)
        folder_1_3.add(this.sceneConfig.objConfig.scale as any, "z", undefined, undefined, 0.01)


        let folder_2 = that.datGUi.addFolder("camera")

        folder_2.open()
        let folder_2_1 = folder_2.addFolder("camPosition")
        folder_2_1.add(this.sceneConfig.cameraConfig.position as any, "x", undefined, undefined, 0.01).listen()
        folder_2_1.add(this.sceneConfig.cameraConfig.position as any, "y", undefined, undefined, 0.01).listen()
        folder_2_1.add(this.sceneConfig.cameraConfig.position as any, "z", undefined, undefined, 0.01).listen()

        let folder_2_2 = folder_2.addFolder("camRotation")
        folder_2_2.add(this.sceneConfig.cameraConfig.rotation as any, "x", undefined, undefined, 0.01).listen()
        folder_2_2.add(this.sceneConfig.cameraConfig.rotation as any, "y", undefined, undefined, 0.01).listen()
        folder_2_2.add(this.sceneConfig.cameraConfig.rotation as any, "z", undefined, undefined, 0.01).listen()


        let folder_3 = that.datGUi.addFolder("light")
        folder_3.open()

        for (let i = 0; i < this.sceneConfig.lightConfig.length; i++) {
            let folder_3_1 = folder_3.addFolder(`light_${i + 1}`)
            const options_1 = ["全局光照", "平行光", "点光源"]
            folder_3_1.add(this.sceneConfig.lightConfig[i], "pattern").options(options_1).onChange(val => {
                if (val === "平行光") {
                    that.sceneConfig.lightConfig[i].pattern = "平行光"
                }
                else if (val === "点光源") {
                    that.sceneConfig.lightConfig[i].pattern = "点光源"
                }
                else if (val === "全局光照") {
                    that.sceneConfig.lightConfig[i].pattern = "全局光照"
                }
            })
            folder_3_1.addColor(this.sceneConfig.lightConfig[i], 'color').name('灯光颜色');
            let folder_3_1_1 = folder_3_1.addFolder(`lightPosition_${i + 1}`)
            folder_3_1_1.add(this.sceneConfig.lightConfig[i].position as any, "x", undefined, undefined, 10)
            folder_3_1_1.add(this.sceneConfig.lightConfig[i].position as any, "y", undefined, undefined, 10)
            folder_3_1_1.add(this.sceneConfig.lightConfig[i].position as any, "z", undefined, undefined, 10)
        }

        let folder_4 = that.datGUi.addFolder("材质")
        folder_4.open()
        for (let i = 0; i < this.renderObjList.length; i++) {
            let folder_4_1 = folder_4.addFolder(`${this.renderObjList[i].mtlname}_${i + 1}`)
            folder_4_1.add(this.renderObjList[i].mtlConfig, "Ns").name('高光反射指数')
            folder_4_1.add(this.renderObjList[i].mtlConfig, "Ni").name('折射率')
            folder_4_1.add(this.renderObjList[i].mtlConfig, "d").name('透明度')
            folder_4_1.add(this.renderObjList[i].mtlConfig, "illum").name('光照模式')
            folder_4_1.addColor(this.renderObjList[i].mtlConfig, "Ka").name('环境光反射系数')
            folder_4_1.addColor(this.renderObjList[i].mtlConfig, "Ks").name('高光反射系数')
            folder_4_1.addColor(this.renderObjList[i].mtlConfig, "Kd").name('漫反射系数')
            folder_4_1.addColor(this.renderObjList[i].mtlConfig, "Ke").name('自发光颜色')
        }



        const timeout = 20

        //旋转
        function a(dist: vec3) {
            let rotation = that.sceneConfig.cameraConfig.rotation
            const r = mat4.create();
            mat4.rotateX(r, r, rotation.x)
            mat4.rotateY(r, r, rotation.y)
            mat4.rotateZ(r, r, rotation.z)
            mat4.translate(r, r, dist);

            return [r[12], r[13], r[14]]
        }

        let dist
        const ctrl = tools();

        function Med(v: vec3) {
            dist = a(v)
            that.sceneConfig.cameraConfig.position.x += dist[0]
            that.sceneConfig.cameraConfig.position.y += dist[1]
            that.sceneConfig.cameraConfig.position.z += dist[2]
        }

        this.canvas?.addEventListener('keydown', function (e) {

            if (e.code === 'KeyS') {
                ctrl.throttle(Med, timeout, [0.0, -0.01, 0.0])
            }
            if (e.code === 'KeyA') {
                ctrl.throttle(Med, timeout, [-0.01, 0.0, 0.0])
            }
            if (e.code === 'KeyW') {
                ctrl.throttle(Med, timeout, [0.0, 0.01, 0.0])
            }
            if (e.code === 'KeyD') {
                ctrl.throttle(Med, timeout, [0.01, 0.0, 0.0])
            }
        });
        this.canvas?.addEventListener('wheel', (e) => {

            if (e.deltaY < 0) {
                ctrl.throttle(Med, timeout, [0.0, 0.0, -0.03])
            }
            if (e.deltaY > 0) {
                ctrl.throttle(Med, timeout, [0.0, 0.0, 0.03])
            }
        })
    }

}