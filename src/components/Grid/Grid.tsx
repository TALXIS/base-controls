import { createContext, useMemo } from "react";
import { useComponent } from "../../hooks"
import { IGridContext } from "./core/interfaces/IGridContext";
import { Grid as GridModel } from "./core/model/Grid";
import { IGrid } from "./interfaces";
import { AgGrid } from './core/components/AgGrid/AgGrid';
import React from 'react';
import { gridTranslations } from './translations';

export const GridContext = createContext<IGridContext>(null as any);

export const Grid = (props: IGrid) => {
    const [labels, notifyOutputChanged] = useComponent('Grid', props, gridTranslations);
    const grid = useMemo(() => new GridModel(props, labels), []);
    grid.updateDependencies(props);
    
    return (
        <GridContext.Provider value={{
            gridInstance: grid
        }}>
        <AgGrid />
        </GridContext.Provider>
    )
}