declare module '*.png';
declare module '*.jpg';
declare module '*.glb';

declare module "*.svg" {
  const content: any;
  export default content;
}