import { useState } from "react";
import { useGridInstance } from "../../../hooks/useGridInstance";
import { IDataset, IRecord } from "@talxis/client-libraries";

interface ISave {
    isSaving: boolean,
    save: () => Promise<boolean>
}

export const useSave = (dataset?: IDataset): ISave => {
    const grid = useGridInstance();
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const save = async (): Promise<boolean> => {
        setIsSaving(true);
        if(dataset) {
            await dataset.save();
        }
        else {
            await grid.dataset.save();
        };
        setIsSaving(false);
        grid.paging.loadExactPage(grid.paging.pageNumber);
        return true;
    }

    return {
        isSaving: isSaving,
        save: save
    }

}