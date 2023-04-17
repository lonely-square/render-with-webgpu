import { scene } from "./scene";
import { sceneRender } from "./sceneRender";
import { tools } from "./tools";
import * as dat from 'dat.gui';
import Stats from 'stats.js'

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
            await this.render()

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

            await this.render()
        }

        this.initController()

    }

    private initController() {

        let that = this

        that.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        that.stats.showPanel(1);
        that.stats.showPanel(2);
        // that.stats.showPanel(3);
        // this.canvas.appendChild(that.stats.dom);
        document.body.appendChild( that.stats.dom );

        function animate() {

            that.stats.begin();

            // monitored code goes here

            that.stats.end();

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);

        console.log("dat")

        that.datGUi.destroy()

        that.datGUi = new dat.GUI
        let folder_1 = that.datGUi.addFolder("transfrom")

        folder_1.open()
        let folder_1_1 = folder_1.addFolder("objPosition")
        folder_1_1.add(this.sceneConfig.objConfig.position as any, "x", undefined, undefined, 0.01).listen
        folder_1_1.add(this.sceneConfig.objConfig.position as any, "y", undefined, undefined, 0.01).listen
        folder_1_1.add(this.sceneConfig.objConfig.position as any, "z", undefined, undefined, 0.01).listen

        let folder_1_2 = folder_1.addFolder("objRotation")
        folder_1_2.add(this.sceneConfig.objConfig.rotation as any, "x", undefined, undefined, 0.01).listen
        folder_1_2.add(this.sceneConfig.objConfig.rotation as any, "y", undefined, undefined, 0.01).listen
        folder_1_2.add(this.sceneConfig.objConfig.rotation as any, "z", undefined, undefined, 0.01).listen

        let folder_1_3 = folder_1.addFolder("objScale")
        folder_1_3.add(this.sceneConfig.objConfig.scale as any, "x", undefined, undefined, 0.01).listen
        folder_1_3.add(this.sceneConfig.objConfig.scale as any, "y", undefined, undefined, 0.01).listen
        folder_1_3.add(this.sceneConfig.objConfig.scale as any, "z", undefined, undefined, 0.01).listen


        let folder_2 = that.datGUi.addFolder("camera")

        folder_2.open()
        let folder_2_1 = folder_2.addFolder("camPosition")
        folder_2_1.add(this.sceneConfig.cameraConfig.position as any, "x", undefined, undefined, 0.01).listen
        folder_2_1.add(this.sceneConfig.cameraConfig.position as any, "y", undefined, undefined, 0.01).listen
        folder_2_1.add(this.sceneConfig.cameraConfig.position as any, "z", undefined, undefined, 0.01).listen

        let folder_2_2 = folder_2.addFolder("camRotation")
        folder_2_2.add(this.sceneConfig.cameraConfig.rotation as any, "x", undefined, undefined, 0.01).listen
        folder_2_2.add(this.sceneConfig.cameraConfig.rotation as any, "y", undefined, undefined, 0.01).listen
        folder_2_2.add(this.sceneConfig.cameraConfig.rotation as any, "z", undefined, undefined, 0.01).listen

        let folder_3 = that.datGUi.addFolder("light")

        folder_3.open()
        const options_1=["全局光照","平行光","点光源"]
        folder_3.add({光源:"全局光照"}, "光源").options(options_1).onChange(val=>{
            if(val === "平行光"){
                that.sceneConfig.lightConfig.pattern ="平行光"
            }
            else if(val === "点光源"){
                that.sceneConfig.lightConfig.pattern="点光源"
            }
            else if(val === "全局光照"){
                that.sceneConfig.lightConfig.pattern="全局光照"
            }
        })
        let folder_3_1 = folder_3.addFolder("lightPosition")
        folder_3_1.add(this.sceneConfig.lightConfig.position as any, "x", undefined, undefined, 0.01).listen
        folder_3_1.add(this.sceneConfig.lightConfig.position as any, "y", undefined, undefined, 0.01).listen
        folder_3_1.add(this.sceneConfig.lightConfig.position as any, "z", undefined, undefined, 0.01).listen



        const timeout = 30
        const dist = 0.1
        const ctrl = tools();
        function upMed() {
            that.sceneConfig.cameraConfig.position.y += dist
        }
        function downMed() {
            that.sceneConfig.cameraConfig.position.y -= dist
        }
        function rightMed() {
            that.sceneConfig.cameraConfig.position.x += dist
        }
        function leftMed() {
            that.sceneConfig.cameraConfig.position.x -= dist
        }
        function innerMed() {
            that.sceneConfig.cameraConfig.position.z -= dist
        }
        function outMed() {
            that.sceneConfig.cameraConfig.position.z += dist
        }

        this.canvas?.addEventListener('keydown', function (e) {

            if (e.code === 'KeyS') {
                ctrl.throttle(downMed, timeout)
            }
            if (e.code === 'KeyA') {
                ctrl.throttle(leftMed, timeout)
            }
            if (e.code === 'KeyW') {
                ctrl.throttle(upMed, timeout)
            }
            if (e.code === 'KeyD') {
                ctrl.throttle(rightMed, timeout)
            }
        });
        this.canvas?.addEventListener('wheel', (e) => {

            if (e.deltaY < 0) {
                ctrl.throttle(innerMed, timeout)
            }
            if (e.deltaY > 0) {
                ctrl.throttle(outMed, timeout)
            }
        })
    }

}