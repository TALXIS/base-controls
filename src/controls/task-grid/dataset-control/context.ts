import { createContext, MutableRefObject } from "react";
import { ILocalizationService, useContextWithNullCheck } from "@utils";
import type { IPcfContext } from "@interfaces";
import type { ITaskRuntime } from "../runtime";
import type { ITaskGridLabels } from "../labels";
import type { ITaskDatasetControlProps } from "./TaskDatasetControl";

export const TaskRuntimeContext = createContext<ITaskRuntime | null>(null);

TaskRuntimeContext.displayName = "TaskRuntimeContext";

/** The task runtime of the enclosing `TaskDatasetControl`; throws outside one. */
export const useTaskRuntime = (): ITaskRuntime => useContextWithNullCheck(TaskRuntimeContext);

export interface ITaskDatasetControlPropsContext {
    labels: ILocalizationService<ITaskGridLabels>;
    pcfContext: IPcfContext;
    propsRef: MutableRefObject<ITaskDatasetControlProps>;
}

//the scope is a stable component, so it reads the props from here
export const TaskDatasetControlPropsContext = createContext<ITaskDatasetControlPropsContext | null>(null);

TaskDatasetControlPropsContext.displayName = "TaskDatasetControlPropsContext";
