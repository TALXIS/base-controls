import React from "react";
import { IEditColumns } from "../../utils/edit-columns";
import { IEditColumnsComponents } from "./components";
import { EDIT_COLUMNS_LABELS, IEditColumnsLabels } from "./labels";

export const EditColumnsContext = React.createContext<IEditColumns>(null as any);
export const EditColumnsComponentsContext = React.createContext<IEditColumnsComponents>(null as any);
export const EditColumnsLabelsContext = React.createContext<IEditColumnsLabels>(EDIT_COLUMNS_LABELS);
export const EditColumnsPropsContext = React.createContext<Partial<{isScopeSelectorVisible?: boolean}>>({isScopeSelectorVisible: true});

export const useEditColumnsLabels = () => {
    return React.useContext(EditColumnsLabelsContext);
}

export const useEditColumnsComponents = () => {
    return React.useContext(EditColumnsComponentsContext);
}

export const useEditColumns = () => {
    return React.useContext(EditColumnsContext);
}

export const useEditColumnsProps = () => {
    return React.useContext(EditColumnsPropsContext);
}