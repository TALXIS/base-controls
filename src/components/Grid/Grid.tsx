import { useMemo } from "react";
import { useControl } from "../../hooks"
import { IGridContext } from "./core/interfaces/IGridContext";
import { Grid as GridModel } from "./core/model/Grid";
import { IGrid } from "./interfaces";
import { AgGrid } from './core/components/AgGrid/AgGrid';
import React from 'react';
import { gridTranslations } from './translations';
import { GridContext } from "./GridContext";

export const Grid = (props: IGrid) => {
    const {labels} = useControl('Grid', props, gridTranslations);
    const providerValue: IGridContext = useMemo(() => {
        return {
            gridInstance: new GridModel(props, labels)
        }
    }, [])
    providerValue.gridInstance.updateDependencies(props);
    return (
        <GridContext.Provider value={providerValue}>
            <AgGrid />
        </GridContext.Provider>
    )
}