import { useGridServices } from "@controls/grid";
import type { ITaskGridServiceRegistry, ITaskGridServiceMap } from "./services";

/** The task grid's services, inside anything the grid draws. */
export const useTaskGridServices = (): ITaskGridServiceRegistry => useGridServices<ITaskGridServiceMap>();

/** One of the task grid's services that is always there, inside anything the grid draws. */
export const useTaskGridService = <TKey extends 'provider' | 'taskExpansion'>(key: TKey): ITaskGridServiceMap[TKey] => useTaskGridServices().get(key);
