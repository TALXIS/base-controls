import type { IDatasetControlModuleMap } from "../../../runtime/interfaces";
import { useRequiredDatasetControlRuntime } from "./context";

/** The module the enclosing `DatasetControl` loaded under `name`; throws when it is not loaded. */
export const useDatasetControlModule = <TName extends keyof IDatasetControlModuleMap>(name: TName): IDatasetControlModuleMap[TName] => {
    return useRequiredDatasetControlRuntime().modules.get(name);
};
