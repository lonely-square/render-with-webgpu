/// <reference types="@webgpu/types" />
declare module '*.wgsl' {
    const shader: string;
    export default shader;
}

declare module '*.jpg' {
    const value: any;
    export default value;
}

declare module '*.vue' {
    import{ComponentOptions} from 'vue';

    const componentOptions:ComponentOptions;
    export default componentOptions;
}
