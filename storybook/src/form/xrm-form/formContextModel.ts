import { IXrmFormLoadResult, createMemoryRecord } from "@talxis/base-controls"
import { formMetadata, getDemoRecord } from "../shared/formModel"
import { createModelStore } from "../shared/modelStore"
import { formContextFormXml } from "./formContextFormXml"

export interface IFormContextSandboxState {
    modelStore: ReturnType<typeof createModelStore>
    getRecord: () => { [key: string]: any }
    onLoad: () => Promise<IXrmFormLoadResult>
    getXml: () => string
    setXml: (value: string) => void
}

export const createFormContextSandboxState = (): IFormContextSandboxState => {
    let currentFormContextXml = formContextFormXml
    const modelStore = createModelStore()
    const formContextRecord = structuredClone(getDemoRecord())

    return {
        modelStore,
        getRecord: () => formContextRecord,
        onLoad: async () => ({
            record: createMemoryRecord({ data: formContextRecord, columns: modelStore.getRuntimeColumns(), metadata: formMetadata }),
            formXml: currentFormContextXml,
        }),
        getXml: () => currentFormContextXml,
        setXml: (value: string) => {
            currentFormContextXml = value
        },
    }
}
