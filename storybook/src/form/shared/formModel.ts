import { createMemoryRecord } from "@talxis/base-controls"
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

export const getDemoRecord = () => demoRecord

export const getMemoryRecord = () => createMemoryRecord({
    columns: getFormColumns(),
    data: { ...demoRecord },
    metadata: formMetadata,
    onSave: async (record) => {
        const fields = record.getColumns().map((column) => column.name).filter((name) => record.isDirty(name))
        Object.assign(demoRecord, record.toRawData())
        return { success: true, fields, recordId: record.getRecordId() }
    },
})
