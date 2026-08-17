import { IXrmFormStrategy, MemoryStrategy } from "@talxis/base-controls/components/Form"
import { formMetadata, getDemoRecord } from "../shared/formModel"
import { createModelStore } from "../shared/modelStore"
import { formContextFormXml } from "./formContextFormXml"

export interface IFormContextSandboxState {
    modelStore: ReturnType<typeof createModelStore>
    getRecord: () => { [key: string]: any }
    getStrategy: () => IXrmFormStrategy
    getXml: () => string
    setXml: (value: string) => void
}

export const createFormContextSandboxState = (): IFormContextSandboxState => {
    let currentFormContextXml = formContextFormXml
    const modelStore = createModelStore()
    const formContextRecord = structuredClone(getDemoRecord())

    class FormContextXrmStrategy extends MemoryStrategy implements IXrmFormStrategy {
        public onGetFormXml(): string {
            return currentFormContextXml
        }
    }

    const formContextStrategy = new FormContextXrmStrategy({
        onGetData: () => formContextRecord,
        onGetColumns: () => modelStore.getRuntimeColumns(),
        onGetMetadata: () => formMetadata,
    })

    return {
        modelStore,
        getRecord: () => formContextRecord,
        getStrategy: () => formContextStrategy,
        getXml: () => currentFormContextXml,
        setXml: (value: string) => {
            currentFormContextXml = value
        },
    }
}
