import { select } from './interface';
import { sceneGUI } from './secneGUI';




const main = async () => {

    if (!navigator.gpu) {
        throw ('Your current browser does not support WebGPU!');
    }


    const canvas = document.getElementById('canvas-webgpu') as HTMLCanvasElement;
    const adapter = await navigator.gpu?.requestAdapter() as GPUAdapter;
    const device = await adapter?.requestDevice() as GPUDevice;
    const objSelect = document.getElementById("objSelect") as HTMLSelectElement

    
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;

    let switchScene:select = new sceneGUI(device,canvas)
    objSelect?.addEventListener("change", e => switchScene.switchScene(objSelect.value))

}


main();
