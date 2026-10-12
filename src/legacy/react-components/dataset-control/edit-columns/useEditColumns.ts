import React from "react";
import { useContext } from "react"
import { IEditColumns } from "@legacy/dataset-control/model/EditColumns";
import { IComponents } from "./components";

export const EditColumnsContext = React.createContext<{
    model: IEditColumns;
    components: IComponents;
}>(null as any);

export const useEditColumns = () => {
    return useContext(EditColumnsContext);
}