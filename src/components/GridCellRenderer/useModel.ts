import React from "react";
import { GridCellRendererModel } from "./GridCellRendererModel";

export const ModelContext = React.createContext<GridCellRendererModel>({} as any);

export const useModel = () => {
    return React.useContext(ModelContext);
}