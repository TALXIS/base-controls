import { createContext, MutableRefObject } from "react";
import { ILocalizationService, useContextWithNullCheck } from "@utils";
import type { IPcfContext } from "@interfaces";
import type { ITaskDatasetControlRuntime } from "../runtime";
import type { ITaskGridLabels } from "../labels";
import type { ITaskDatasetControlProps } from "./TaskDatasetControl";

export const TaskDatasetControlContext = createContext<ITaskDatasetControlRuntime | null>(null);

TaskDatasetControlContext.displayName = "TaskDatasetControlContext";

/** The task dataset control the part is drawn in; throws outside one. */
export const useTaskDatasetControl = (): ITaskDatasetControlRuntime => useContextWithNullCheck(TaskDatasetControlContext);

export interface ITaskDatasetControlPropsContext {
    labels: ILocalizationService<ITaskGridLabels>;
    pcfContext: IPcfContext;
    propsRef: MutableRefObject<ITaskDatasetControlProps>;
}

//the scope is a stable component, so it reads the props from here
export const TaskDatasetControlPropsContext = createContext<ITaskDatasetControlPropsContext | null>(null);

TaskDatasetControlPropsContext.displayName = "TaskDatasetControlPropsContext";
