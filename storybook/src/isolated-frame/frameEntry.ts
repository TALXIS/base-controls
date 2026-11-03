import { IGridExampleFile, runGridExampleInFrame } from '../grid/GridLivePreview'

declare global {
    interface Window {
        /** Called by the script createSandboxFrameScripts adds after this entry. */
        __runSandboxFiles?: (files: IGridExampleFile[]) => void
    }
}

window.__runSandboxFiles = runGridExampleInFrame
