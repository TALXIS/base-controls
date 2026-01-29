import React from "react";
import { useContext } from "react"
import { IEditColumns } from "../../../utils/dataset-control/EditColumns";

export const EditColumnsContext = React.createContext<IEditColumns>(null as any);

export const useEditColumns = () => {
    return useContext(EditColumnsContext);
}