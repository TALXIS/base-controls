import { createContext, MutableRefObject } from "react";
import { useContextWithNullCheck } from "@core";
import type { IPcfContext } from "@pcf/interfaces";
import type { ITaskRuntime } from "../../runtime";
import type { ITaskDatasetControlProps } from "./TaskDatasetControl";

export const TaskRuntimeContext = createContext<ITaskRuntime | null>(null);

TaskRuntimeContext.displayName = "TaskRuntimeContext";

/** The task runtime of the enclosing `TaskDatasetControl`. */
export const useTaskRuntime = (): ITaskRuntime => useContextWithNullCheck(TaskRuntimeContext);

export interface ITaskDatasetControlPropsContext {
    pcfContext: IPcfContext;
    propsRef: MutableRefObject<ITaskDatasetControlProps>;
}

//the scope is a stable component
export const TaskDatasetControlPropsContext = createContext<ITaskDatasetControlPropsContext | null>(null);

TaskDatasetControlPropsContext.displayName = "TaskDatasetControlPropsContext";
