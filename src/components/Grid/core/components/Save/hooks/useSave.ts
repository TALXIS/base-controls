import { useState } from "react";
import { useGridInstance } from "../../../hooks/useGridInstance";
import { IDataset, IRecord } from "@talxis/client-libraries";

interface ISave {
    isSaving: boolean,
    save: () => Promise<boolean>
}

export const useSave = (): ISave => {
    const grid = useGridInstance();
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const save = async (): Promise<boolean> => {
        setIsSaving(true);
        await grid.dataset.paging.loadExactPage(grid.paging.pageNumber, true);
        setIsSaving(false);
        return true;
    }

    return {
        isSaving: isSaving,
        save: save
    }

}