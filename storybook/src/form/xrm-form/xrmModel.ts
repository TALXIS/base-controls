import { IXrmFormStrategy, MemoryStrategy } from "@talxis/base-controls/components/Form"
import { formMetadata, getDemoRecord } from "../shared/formModel"
import { defaultFormXml } from "./defaultFormXml"
import { createModelStore } from "../shared/modelStore"

let currentFormXml = defaultFormXml
export const xrmModelStore = createModelStore()

class SandboxXrmStrategy extends MemoryStrategy implements IXrmFormStrategy {
    public onGetFormXml(): string {
        return currentFormXml
    }
}

const xrmRecord = getDemoRecord()
const xrmStrategy = new SandboxXrmStrategy({
    onGetData: () => xrmRecord,
    onGetColumns: () => xrmModelStore.getRuntimeColumns(),
    onGetMetadata: () => formMetadata,
})

export const getXrmRecord = () => xrmRecord

export const getXrmStrategy = () => xrmStrategy

export const getCurrentFormXml = () => currentFormXml

export const setCurrentFormXml = (value: string) => {
    currentFormXml = value
}
