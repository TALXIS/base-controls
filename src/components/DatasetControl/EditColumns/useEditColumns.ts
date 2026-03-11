import React from "react";
import { useContext } from "react"
import { IEditColumns } from "../../../utils/dataset-control/EditColumns";
import { IComponents } from "./components/components";
import { IColumn } from "@talxis/client-libraries";

export const EditColumnsContext = React.createContext<{
    model: IEditColumns;
    components: IComponents;
    showScopeSelector: boolean;
    visibleColumns: IColumn[];
    
}>(null as any);

export const useEditColumns = () => {
    return useContext(EditColumnsContext);
}