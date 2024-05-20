import { useContext, useEffect, useState } from "react"
import equal from 'fast-deep-equal/es6';
import { IEntityRecord } from "../../interfaces";
import { Grid } from "../model/Grid";
import { IGridColumn } from "../interfaces/IGridColumn";
import { GridContext } from "../../Grid";

interface IGridController {
    columns: IGridColumn[],
    records: IEntityRecord[]
}

export const useGridController = (gridInstance?: Grid): IGridController => {
    const grid = gridInstance ?? useContext(GridContext).gridInstance;
    const [columns, setColumns] = useState<IGridColumn[]>(grid.columns);
    const [records, setRecords] = useState<IEntityRecord[]>(grid.records);

    //only change the columns reference if there is some change
    useEffect(() => {
        (async () => {
            setRecords(grid.refreshRecords());
            const newColumns = await grid.refreshColumns();
            if(equal(newColumns, columns)) {
                return;
            }
            setColumns(newColumns);
        })();
    }, [grid.shouldRerender]);
    return {
        columns,
        records
    }
}