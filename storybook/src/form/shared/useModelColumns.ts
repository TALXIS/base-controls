import type { IColumn } from "@talxis/client-libraries"
import { useEffect, useState } from "react"
import type { IModelStore } from "./modelStore"

export const useModelColumns = (store: IModelStore) => {
    const [columns, setColumns] = useState<IColumn[]>(() => store.getEditableColumns())

    useEffect(() => {
        store.setEditableColumns(columns)
    }, [columns, store])

    return [columns, setColumns] as const
}
