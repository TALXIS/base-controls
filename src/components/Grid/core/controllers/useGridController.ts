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
    const [records, setRecords] = useState<IEntityRecord[]>(() => grid.refreshRecords());

    const getRecordValues = (columns: IGridColumn[], records: IEntityRecord[]) => {
        const newRecordValues = records.map(x => {
            const values = [];
            for(const column of columns) {
                values.push(x.getValue(column.key))
            }
            return values;
        });
        return newRecordValues;
    }

    //only change columns and records reference if there is a change
    useEffect(() => {
        (async () => {
            const newColumns = await grid.refreshColumns();
            const newRecordValues = getRecordValues(newColumns, grid.refreshRecords());
            if(!equal(newColumns, columns)) {
                setColumns(newColumns);
            }
            if(!equal(newRecordValues, getRecordValues(newColumns, records))) {
                setRecords(grid.records);
            }
        })();
    }, [grid.shouldRerender]);
    return {
        columns,
        records
    }
}