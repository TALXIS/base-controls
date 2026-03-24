import React from "react";
import { IEditColumns } from "../../utils/edit-columns";
import { IViewSwitcher } from "../../utils/view-switcher";
import { IQuickFind } from "../../utils/quick-find";
import { ISimpleDatasetControl } from "../../utils/dataset-control";

export const DatasetControlContext = React.createContext<ISimpleDatasetControl>(null as any);
export const EditColumnsContext = React.createContext<IEditColumns>(null as any);
export const ViewSwitcherContext = React.createContext<IViewSwitcher>(null as any);
export const QuickFindContext = React.createContext<IQuickFind>(null as any);

export const useEditColumns = () => {
    return React.useContext(EditColumnsContext);
}

export const useViewSwitcher = () => {
    return React.useContext(ViewSwitcherContext);
}

export const useQuickFind = () => {
    return React.useContext(QuickFindContext);
}

export const useDatasetControl = () => {
    return React.useContext(DatasetControlContext);
}