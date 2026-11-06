import { createContext } from "react";
import { useContextWithNullCheck } from "@core";
import type { ITaskRuntime } from "../../runtime";

export const TaskRuntimeContext = createContext<ITaskRuntime | null>(null);

TaskRuntimeContext.displayName = "TaskRuntimeContext";

/** The task runtime of the enclosing `TaskDatasetControl`. */
export const useTaskRuntime = (): ITaskRuntime => useContextWithNullCheck(TaskRuntimeContext);
