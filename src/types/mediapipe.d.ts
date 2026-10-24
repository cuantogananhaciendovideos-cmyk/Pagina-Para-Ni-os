export interface NormalizedLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface HandsResults {
  multiHandLandmarks?: NormalizedLandmark[][];
  multiHandedness?: Array<{ index: number; label: string; score: number }>;
  image?: HTMLVideoElement | HTMLCanvasElement;
}

export interface HandsOptions {
  maxNumHands?: number;
  modelComplexity?: number;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
  locateFile?: (file: string) => string;
}

export declare class Hands {
  constructor(config?: { locateFile?: (file: string) => string });
  setOptions(options: HandsOptions): void;
  onResults(listener: (results: HandsResults) => void): void;
  send(input: { image: HTMLVideoElement | HTMLCanvasElement }): Promise<void>;
  close(): Promise<void>;
}

export declare class Camera {
  constructor(
    element: HTMLVideoElement,
    options: {
      onFrame: () => Promise<void> | void;
      width?: number;
      height?: number;
    }
  );
  start(): Promise<void>;
  stop(): Promise<void>;
}

declare global {
  interface Window {
    Hands?: typeof Hands;
    Camera?: typeof Camera;
    HAND_CONNECTIONS?: Array<[number, number]>;
    drawConnectors?: (
      ctx: CanvasRenderingContext2D,
      landmarks: NormalizedLandmark[],
      connections: Array<[number, number]>,
      style?: { color?: string; lineWidth?: number }
    ) => void;
    drawLandmarks?: (
      ctx: CanvasRenderingContext2D,
      landmarks: NormalizedLandmark[],
      style?: { color?: string; lineWidth?: number; radius?: number }
    ) => void;
  }
}
