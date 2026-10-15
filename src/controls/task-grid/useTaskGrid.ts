import { useGridServices } from "@controls/grid";
import type { ITaskGrid } from "./runtime";
import type { ITaskGridServiceLocator, ITaskGridServiceMap } from "./services";
import { useTaskGridContext } from "./context";

/** The task grid the component is drawn inside of. */
export const useTaskGrid = (): ITaskGrid => useTaskGridContext().runtime;

/** The task grid's services, inside anything the grid draws. */
export const useTaskGridServices = (): ITaskGridServiceLocator => useGridServices<ITaskGridServiceMap>();

/** One of the task grid's services that is always there, inside anything the grid draws. */
export const useTaskGridService = <TKey extends 'provider' | 'taskGrid' | 'taskExpansion'>(key: TKey): ITaskGridServiceMap[TKey] => useTaskGridServices().get(key);
