import { Scene_, select } from './interface';
import { sceneGUI } from './secneGUI';




const main = async () => {

    if (!navigator.gpu) {
        throw ('Your current browser does not support WebGPU!');
    }

    const canvas = document.getElementById('canvas-webgpu') as HTMLCanvasElement;
    const adapter = await navigator.gpu?.requestAdapter() as GPUAdapter;
    const device = await adapter?.requestDevice() as GPUDevice;
    const objSelect = document.getElementById("objSelect") as HTMLSelectElement
    const addCubeButton = document.getElementById("addCubeButton") as HTMLButtonElement
    const addLightButton = document.getElementById("addLightButton") as HTMLButtonElement
    const subButton = document.getElementById("subButton") as HTMLButtonElement
    const objInput = document.getElementById("objInput") as HTMLInputElement
    const mtlInput = document.getElementById("mtlInput") as HTMLInputElement
    const texInput = document.getElementById("texInput") as HTMLInputElement

    
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;

    let switchScene:Scene_ = new sceneGUI(device,canvas)
    objSelect?.addEventListener("change", e => switchScene.switchScene(objSelect.value))
    addCubeButton?.addEventListener("click", e => switchScene.addCube())
    addLightButton?.addEventListener("click", e => switchScene.addlight())
    subButton?.addEventListener("click", e => switchScene.addModel("上传模型",objInput,mtlInput,texInput))

}


main();
