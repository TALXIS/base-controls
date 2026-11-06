import { useEffect, useMemo } from "react";
import type { IDatasetControlPartMap, IDatasetControlServiceMap } from "../../runtime/interfaces";
import { useOptionalDatasetControlInternal } from "./context";

/** Creates a part once and registers it on the control while the calling component is mounted. */
export const useRegisterDatasetControlPart = <TName extends keyof IDatasetControlPartMap, TPart extends IDatasetControlServiceMap[TName]>(name: TName, create: () => TPart): TPart => {
    const runtime = useOptionalDatasetControlInternal();
    //registered as it is made: a part can be read before the first effect, such as the grid before AG Grid mounts
    const part = useMemo(() => {
        const created = create();
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
