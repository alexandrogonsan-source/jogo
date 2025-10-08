
export interface Choice {
  text: string;
}

export interface SceneData {
  description: string;
  choices: Choice[];
}

export interface FullScene extends SceneData {
  imageUrl: string;
}

export type GameState = 'start' | 'playing' | 'loading' | 'error';
