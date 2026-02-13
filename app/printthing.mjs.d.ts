declare module "*printthing.mjs" {
  export interface EmscriptenFS {
    writeFile(path: string, data: string | ArrayBufferView): void;

    readFile(
      path: string,
      opts?: { encoding?: "utf8" | "binary" }
    ): string | Uint8Array;

    unlink(path: string): void;
    mkdir(path: string): void;
    readdir(path: string): string[];
  }

  export interface EmscriptenModule {
    FS: EmscriptenFS;

    ccall(
      ident: string,
      returnType: string | null,
      argTypes: string[],
      args: any[]
    ): any;

    cwrap(
      ident: string,
      returnType: string | null,
      argTypes: string[]
    ): (...args: any[]) => any;

    // memory views (very useful later)
    HEAPU8: Uint8Array;
    HEAP32: Int32Array;
    HEAPF32: Float32Array;
  }

  const createModule: (opts?: any) => Promise<EmscriptenModule>;
  export default createModule;
}
