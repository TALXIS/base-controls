import React from "react";
import { DatasetControlModel } from "./DatasetControlModel";

export const ModelContext = React.createContext<DatasetControlModel>({} as any);

export const useModel = () => {
    return React.useContext(ModelContext);
}