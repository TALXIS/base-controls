import { createContext, useEffect, useMemo } from "react";
import { useComponent } from "../../hooks"
import { useGridController } from "./core/controllers/useGridController";
import { IGridContext } from "./core/interfaces/IGridContext";
import { Grid } from "./core/model/Grid";
import { IGrid } from "./interfaces"

export const GridContext = createContext<IGridContext>(null as any);

export const GridProvider = (props: IGrid) => {
    const [labels, notifyOutputChanged] = useComponent('Grid', props, );
    const grid = useMemo(() => new Grid(props, labels), []);
    const {isEditable, columns, records} = useGridController(grid);
    grid.updateDependencies(props);
    
    return (
        <GridContext.Provider value={{
            gridInstance: grid
        }}>
        </GridContext.Provider>
    )
}