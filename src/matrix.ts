import { mat4, vec3 } from 'gl-matrix';

export function getTransformationMatrix(aspect : number,position : vec3 , rotation :vec3 ,scale : vec3):Float32Array {

    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI /2, aspect, 0.0001, 2.0);
    const viewMatrix = mat4.create();
    mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(position[0], position[1], position[2]));
    // mat4.rotate(
    //   viewMatrix,
    //   viewMatrix,
    //   10,
    //   vec3.fromValues(rotation[0], rotation[1], rotation[2])
    // );
    mat4.rotateX(viewMatrix, viewMatrix,rotation[0])
    mat4.rotateY(viewMatrix, viewMatrix,rotation[1])
    mat4.rotateZ(viewMatrix, viewMatrix,rotation[2])
    mat4.scale(viewMatrix, viewMatrix, vec3.fromValues(scale[0], scale[1], scale[2]));

    const modelViewProjectionMatrix = mat4.create();
    mat4.multiply(modelViewProjectionMatrix, projectionMatrix, viewMatrix);

    return modelViewProjectionMatrix as Float32Array;
  }