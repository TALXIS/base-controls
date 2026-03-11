import React from "react";
import { useContext } from "react"
import { IComponents } from "./components/components";
import { IFunctions } from "./functions";
import { IEditColumns } from "../../utils/edit-columns";

export const EditColumnsContext = React.createContext<{
    components: IComponents;
    functions: IFunctions;
    model: IEditColumns;
    showScopeSelector: boolean;
    
}>(null as any);

export const useEditColumns = () => {
    return useContext(EditColumnsContext);
}