import { useMemo } from "react";
import { useGridInstance } from "../../core/hooks/useGridInstance";
import { Selection } from '../model/Selection';

interface ISelectionController {
    toggle: (record: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord) => void;
}

export const useSelectionController = (): ISelectionController => {
    const grid = useGridInstance();
    const selection = useMemo(() => new Selection(grid), []);

    return {
        toggle: (record: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord) => selection.toggle(record)
    }
}