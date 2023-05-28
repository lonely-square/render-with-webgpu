<template>
  <div class="common-layout">

    <el-row class="row-bg">
      <el-col :span="7">
        <el-tabs tab-position="left" style="height: 180px" class="demo-tabs">
          <el-tab-pane label="加载默认场景">
            <div class="m-4">
              <p>请选择需要加载的模型：</p>
              <el-select v-model="value1" placeholder="选择模型" style="width: 180px" @change="onSelect">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>
          </el-tab-pane>
          <el-tab-pane label="上传模型文件">
            <el-form label-width="auto">
              <el-form-item label="上传obj文件：">
                <input type="file" id="objInput" name="fileToUpload">
              </el-form-item>

              <el-form-item label="上传mtl文件：">
                <input type="file" id="mtlInput" name="fileToUpload">
              </el-form-item>

              <el-form-item label="上传贴图文件：">
                <input type="file" id="texInput" name="fileToUpload" multiple>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="onSubmit">开始渲染</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-col>

      <el-col :span="6" v-if="changeFlag">
          <div style="display: inline-block; width: 150px;">
            <el-button type="success" id="addCubeButton" @click="() => { switchScene.addCube() }">添加正方面</el-button>
          </div>
          
        <div style="display: inline-block; width: 150px;">
          <el-button type="success" id="addLightButton" @click="() => { switchScene.addlight() }">添加光源</el-button>
        </div>     
      </el-col>

      <el-col :span="8">
        <div id="stats"></div>
      </el-col>
    </el-row>

    <el-container>
      <el-main >
          <canvas style="width: 100%;height: 100%;height: 900px" id="canvas1" tabindex='-1'></canvas>    
      </el-main>
      <el-aside width="180px">
        <div id="datui"></div>
      </el-aside>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { onMounted } from 'vue'
import { Scene_ } from '../render/interface';
import { sceneGUI } from '../render/secneGUI';

let switchScene: Scene_

const changeFlag = ref(false)

const value1 = ref('')
const options = [
  {
    value: 'lantern',
    label: '灯笼',
  },
  {
    value: 'girl',
    label: '女孩',
  }
]



const onSelect = function (val: string) {
  switchScene.switchScene(val)
  changeFlag.value = true
}

const onSubmit = function () {
  const objInput = document.getElementById("objInput") as HTMLInputElement
  const mtlInput = document.getElementById("mtlInput") as HTMLInputElement
  const texInput = document.getElementById("texInput") as HTMLInputElement
  switchScene.addModel("上传模型", objInput, mtlInput, texInput)
  changeFlag.value = true
}

onMounted(async () => {
  if (!navigator.gpu) {
    throw ('Your current browser does not support WebGPU!');
  }
  const canvas = document.getElementById('canvas1') as HTMLCanvasElement;
  const adapter = await navigator.gpu?.requestAdapter() as GPUAdapter;
  const device = await adapter?.requestDevice() as GPUDevice;
  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
  switchScene = new sceneGUI(device, canvas)

})

</script>

<style scoped></style>