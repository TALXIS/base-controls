import * as React from "react";

/** The custom-column commands the Edit Columns panel offers its column rows. */
interface ITaskGridEditColumnsContext {
    onEditColumn: (columnName: string, requireRemount?: boolean) => void;
    onDeleteColumn: (columnName: string) => void;
    onCreateColumn: () => void;
}
/** Carries the custom-column commands down to the Edit Columns panel rows. */
export const TaskGridEditColumnsContext = React.createContext<ITaskGridEditColumnsContext>({} as any);

/** Returns the custom-column commands. Only meaningful inside the custom-columns Edit Columns panel. */
export const useTaskGridEditColumns = () => {
    return React.useContext(TaskGridEditColumnsContext);
}