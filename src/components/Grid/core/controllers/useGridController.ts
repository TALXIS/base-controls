import { useContext, useEffect, useState } from "react"
import equal from 'fast-deep-equal/es6';
import { Grid } from "../model/Grid";
import { IGridColumn } from "../interfaces/IGridColumn";
import { GridContext } from "../../GridContext";

interface IGridController {
    columns: IGridColumn[]
}

export const useGridController = (gridInstance?: Grid): IGridController => {
    const grid = gridInstance ?? useContext(GridContext).gridInstance;
    const [columns, setColumns] = useState<IGridColumn[]>(grid.columns);

    const preprocessColumns = (columns: IGridColumn[]): any[] => {
        return columns.map(({ getEntityName, metadata, ...rest }) => rest);
    };
    
    //only change columns and records reference if there is a change
    useEffect(() => {
        (async () => {
            const newColumns = await grid.refreshColumns();
            if(!equal(preprocessColumns(newColumns), preprocessColumns(columns))) {
                setColumns(newColumns);
            }
        })();
    }, [grid.loading]);

    useEffect(() => {

    }, [columns]);
    return {
        columns
    }
}