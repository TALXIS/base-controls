import { createContext } from "react";
import { useContextWithNullCheck } from "@utils";
import type { ITaskRuntime } from "./runtime";
import type { ITaskGridComponents } from "./interfaces";

export interface ITaskGridContext {
    runtime: ITaskRuntime;
    components: ITaskGridComponents;
}

export const TaskGridContext = createContext<ITaskGridContext | null>(null);

TaskGridContext.displayName = "TaskGridContext";

export const useTaskGridContext = (): ITaskGridContext => useContextWithNullCheck(TaskGridContext);
