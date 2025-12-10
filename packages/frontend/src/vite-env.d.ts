/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Allow importing markdown files as raw strings
declare module '*.md?raw' {
  const content: string;
  export default content;
}

// Build info injected at build time
declare const __BUILD_COMMIT__: string;
declare const __BUILD_COMMIT_SHORT__: string;
declare const __BUILD_BRANCH__: string;
declare const __BUILD_TIME__: string;
