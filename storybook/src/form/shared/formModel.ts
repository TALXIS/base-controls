import { MemoryStrategy } from "@talxis/base-controls/components/Form"
import { getDemoData } from "../../data"
import { reactModelStore } from "../react-form/reactModel"

const demoRecord = getDemoData()[0] as { [key: string]: any }
const unsupportedSandboxFields = new Set(["lookup", "file", "image"])

export const formMetadata = {
    PrimaryIdAttribute: "id",
    PrimaryNameAttribute: "text",
}

export const getFormColumns = () =>
    reactModelStore.getRuntimeColumns().filter(
        (column) => !column.isHidden && !!column.displayName && !unsupportedSandboxFields.has(column.name)
    )

const memoryStrategy = new MemoryStrategy({
    onGetData: () => demoRecord,
    onGetColumns: () => getFormColumns(),
    onGetMetadata: () => formMetadata,
})

export const getDemoRecord = () => demoRecord

export const getMemoryStrategy = () => memoryStrategy
