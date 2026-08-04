import type { IColumn } from "@talxis/client-libraries"
import { initialModelColumns, ribbonColumn } from "./modelDefinition"

export interface IModelStore {
    getEditableColumns: () => IColumn[]
    getRuntimeColumns: () => IColumn[]
    setEditableColumns: (columns: IColumn[]) => void
}

const cloneColumns = (columns: IColumn[]) => columns.map((column) => structuredClone(column))

export const createModelStore = (initialColumns = initialModelColumns): IModelStore => {
    let currentModelColumns: IColumn[] = cloneColumns(initialColumns)

    return {
        getEditableColumns: () => cloneColumns(currentModelColumns),
        getRuntimeColumns: () => [...cloneColumns(currentModelColumns), structuredClone(ribbonColumn)],
        setEditableColumns: (columns: IColumn[]) => {
            currentModelColumns = cloneColumns(columns)
        },
    }
}

export const serializeModelColumns = (columns: IColumn[]) => JSON.stringify(columns, null, 2)

export const parseModelColumns = (value: string) => {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) {
        throw new Error("Model JSON must be an array of IColumn definitions.")
    }

    return parsed as IColumn[]
}
