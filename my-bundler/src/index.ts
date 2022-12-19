// src/index.ts
import { Bundle } from './Bundle';

export interface BuildOptions {
  input: string;
}

export function build(options: BuildOptions) {
  const bundle = new Bundle({
    entry: options.input
  });
  return bundle.build().then(() => {
    return {
      generate: () => bundle.render()
    };
  });
}