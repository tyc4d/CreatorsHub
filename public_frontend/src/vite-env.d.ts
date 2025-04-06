/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DONATION_FACTORY_ADDRESS: string
  // 其他環境變量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
