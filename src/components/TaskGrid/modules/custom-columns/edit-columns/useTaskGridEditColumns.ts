import * as React from "react";

interface ITaskGridEditColumnsContext {
    onEditColumn: (columnName: string, requireRemount?: boolean) => void;
    onDeleteColumn: (columnName: string) => void;
    onCreateColumn: () => void;
}
export const TaskGridEditColumnsContext = React.createContext<ITaskGridEditColumnsContext>({} as any);

export const useTaskGridEditColumns = () => {
    return React.useContext(TaskGridEditColumnsContext);
}