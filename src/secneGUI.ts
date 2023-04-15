import { scene } from "./scene";
import { sceneRender } from "./sceneRender";
import { tools } from "./tools";

export class sceneGUI extends sceneRender {

    async switchScene(name: string): Promise<void> {

        this.name =name
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
        const timeout = 30
        const dist = 0.1
        const ctrl = tools();
        function upMed() {
            that.sceneConfig.objConfig.position.y -= dist
        }
        function downMed() {
            that.sceneConfig.objConfig.position.y += dist
        }
        function rightMed() {
            that.sceneConfig.objConfig.position.x -= dist
        }
        function leftMed() {
            that.sceneConfig.objConfig.position.x += dist
        }
        function innerMed() {
            that.sceneConfig.objConfig.position.z += dist
        }
        function outMed() {
            that.sceneConfig.objConfig.position.z -= dist
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