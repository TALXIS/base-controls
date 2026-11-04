/// <reference types="vite/client" />
import { IsolatedFrameScript } from '@talxis/base-controls'
import type { IGridExampleFile } from '../grid/GridLivePreview'

//a build emits the entry under a fixed name
const FRAME_ENTRY: IsolatedFrameScript = {
    src: import.meta.env.DEV ? import.meta.url.replace(/[^/]*$/, 'frameEntry.ts') : `${import.meta.env.BASE_URL}isolated-frame-entry.js`,
    type: 'module',
}

/** What a frame loads to run a live example: the docs' bundle, then the example's own files. */
export const createSandboxFrameScripts = (files: IGridExampleFile[]): IsolatedFrameScript[] => {
    const run = new Blob([`window.__runSandboxFiles(${JSON.stringify(files)})`], { type: 'text/javascript' })
    return [FRAME_ENTRY, { src: URL.createObjectURL(run), type: 'module' }]
}
