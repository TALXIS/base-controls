import { useContext, useEffect, useState } from "react"
import equal from 'fast-deep-equal';
import { IEntityRecord } from "../../interfaces";
import { Grid } from "../model/Grid";
import { IGridColumn } from "../interfaces/IGridColumn";
import { GridContext } from "../../Grid";

interface IGridController {
    isEditable: boolean,
    columns: IGridColumn[],
    records: IEntityRecord[]
}

export const useGridController = (gridInstance?: Grid): IGridController => {
    const grid = gridInstance ?? useContext(GridContext).gridInstance;
    const [columns, setColumns] = useState<IGridColumn[]>([]);
    const [records, setRecords] = useState<IEntityRecord[]>([]);
    const isEditable = columns.find(x=> x.isEditable) ? true : false;

    //only change the columns reference if there is some change
    useEffect(() => {
        (async () => {
            const newColumns = await grid.refreshColumns();
            if(equal(newColumns, columns)) {
                return;
            }
            setColumns(newColumns);
        })();
    }, [grid.props.parameters.Grid.columns]);

        //sortedRecordIds does not trigger in Power Apps on requestRender, wont work if some value changed, rerender every time or check the getValue of each record on each column
        useEffect(() => {
            setRecords(grid.refreshRecords());
        }, [grid.props.parameters.Grid]);
    
    return {
        isEditable,
        columns,
        records
    }
}