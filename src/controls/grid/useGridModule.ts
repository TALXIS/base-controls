import type { IGridModuleMap } from "./interfaces";
import { useGridServiceInternal } from "./useGridService";

/** One of the grid's modules by name, inside anything the grid draws; throws if it was not given. */
export const useGridModule = <TName extends keyof IGridModuleMap>(name: TName): IGridModuleMap[TName] =>
    useGridServiceInternal('grid').modules.get(name);
