import { IXrmFormLoadResult, createMemoryRecord } from "@talxis/base-controls"
import { formMetadata, getDemoRecord } from "../shared/formModel"
import { defaultFormXml } from "./defaultFormXml"
import { createModelStore } from "../shared/modelStore"

let currentFormXml = defaultFormXml
export const xrmModelStore = createModelStore()

const xrmRecord = getDemoRecord()

export const getXrmRecord = () => xrmRecord

export const loadXrmForm = async (): Promise<IXrmFormLoadResult> => ({
    record: createMemoryRecord({ data: xrmRecord, columns: xrmModelStore.getRuntimeColumns(), metadata: formMetadata }),
    formXml: currentFormXml,
})

export const getCurrentFormXml = () => currentFormXml

export const setCurrentFormXml = (value: string) => {
    currentFormXml = value
}
