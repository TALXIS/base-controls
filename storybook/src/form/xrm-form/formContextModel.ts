import { IXrmFormStrategy, MemoryStrategy } from "@talxis/base-controls/components/Form"
import { formMetadata, getDemoRecord } from "../shared/formModel"
import { createModelStore } from "../shared/modelStore"
import { formContextFormXml } from "./formContextFormXml"

let currentFormContextXml = formContextFormXml
export const formContextModelStore = createModelStore()

class FormContextXrmStrategy extends MemoryStrategy implements IXrmFormStrategy {
    public onGetFormXml(): string {
        return currentFormContextXml
    }
}

const formContextRecord = structuredClone(getDemoRecord())
const formContextStrategy = new FormContextXrmStrategy({
    onGetData: () => formContextRecord,
    onGetColumns: () => formContextModelStore.getRuntimeColumns(),
    onGetMetadata: () => formMetadata,
})

export const getFormContextRecord = () => formContextRecord

export const getFormContextStrategy = () => formContextStrategy

export const getFormContextXml = () => currentFormContextXml

export const setFormContextXml = (value: string) => {
    currentFormContextXml = value
}
