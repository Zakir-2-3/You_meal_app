declare module "@activetheory/fit-text" {
  interface FitTextOptions {
    el: HTMLElement;
    box?: HTMLElement;
    singleLine?: boolean;
    minFontSize?: number;
    maxFontSize?: number;
    boxMultiplier?: [number, number];
    afterFit?: (result: any) => void;
  }

  export default function fitText(options: FitTextOptions): any;
}
