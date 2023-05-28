
import { mat4, vec3 } from 'gl-matrix';
import { objConfig as ObjConfig, sceneConfig } from './interface';

export function getTransformationMatrix(aspect: number, objConfig:ObjConfig,sceneConfig:sceneConfig): Float32Array[] {

  let position = objConfig.position
  let rotation = objConfig.rotation
  let scale = objConfig.scale

  let camPosition = sceneConfig.cameraConfig.position
  let camRotation = sceneConfig.cameraConfig.rotation

  //函数中，输出，左矩阵，右矩阵

 //变世界坐标
  const modelMatrix = mat4.create();
  mat4.translate(modelMatrix, modelMatrix, vec3.fromValues(position.x, position.y, position.z));
  mat4.rotateX(modelMatrix, modelMatrix, rotation.x)
  mat4.rotateY(modelMatrix, modelMatrix, rotation.y)
  mat4.rotateZ(modelMatrix, modelMatrix, rotation.z)
  mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(scale.x, scale.y, scale.z));

//变摄像机坐标
  const cameraMatrix = mat4.create();
  mat4.rotateX(cameraMatrix,cameraMatrix, -camRotation.x)
  mat4.rotateY(cameraMatrix, cameraMatrix, -camRotation.y)
  mat4.rotateZ(cameraMatrix, cameraMatrix, -camRotation.z)
  mat4.translate(cameraMatrix, cameraMatrix, vec3.fromValues(-camPosition.x, -camPosition.y, -camPosition.z));

//变裁剪坐标
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, Math.PI/3 , aspect, 0.001, 2000.0);

  const modelViewProjectionMatrix = mat4.create();
  mat4.multiply(modelViewProjectionMatrix, cameraMatrix, modelMatrix);
  mat4.multiply(modelViewProjectionMatrix, projectionMatrix, modelViewProjectionMatrix);

  const rotationMatrix = mat4.create();
  mat4.rotateX(rotationMatrix, rotationMatrix, rotation.x)
  mat4.rotateY(rotationMatrix, rotationMatrix, rotation.y)
  mat4.rotateZ(rotationMatrix, rotationMatrix, rotation.z)

  const vp = mat4.create();
  mat4.multiply(vp, projectionMatrix, cameraMatrix)

  /**
   * mvp
   * 单m中的旋转
   * 单m
   * vp
   */
  return [modelViewProjectionMatrix as Float32Array,rotationMatrix as Float32Array,modelMatrix as Float32Array,vp as Float32Array ];
}