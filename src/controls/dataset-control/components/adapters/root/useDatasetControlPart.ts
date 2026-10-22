import { useEffect, useMemo } from "react";
import type { IDatasetControlPartMap, IDatasetControlServiceMap } from "../../../runtime/interfaces";
import { useDatasetControlRuntime } from "./context";

/** Creates the part once and registers it under `name` on the enclosing `DatasetControl` while the component is mounted. */
export const useDatasetControlPart = <TName extends keyof IDatasetControlPartMap, TPart extends IDatasetControlServiceMap[TName]>(name: TName, onCreate: () => TPart): TPart => {
    const runtime = useDatasetControlRuntime();
    //registered as it is made: a part can be read before the first effect, such as the grid before AG Grid mounts
    const part = useMemo(() => {
        const created = onCreate();
        runtime?.services.register(name, () => created);
        return created;
    }, []);
    useEffect(() => () => {
        //a replacing part registers before this one unmounts
        if (runtime && runtime.services.find(name) as unknown === part) {
            runtime.services.unregister(name);
        }
    }, []);
    return part;
};
