import { useEffect, useMemo } from "react";
import type { IDatasetControlPartMap, IDatasetControlServiceMap } from "../../runtime/interfaces";
import { useOptionalDatasetControlInternal } from "./context";

/** Creates a part once and provides it on the control while the calling component is mounted. */
export const useProvideDatasetControlPart = <TName extends keyof IDatasetControlPartMap, TPart extends IDatasetControlServiceMap[TName]>(name: TName, create: () => TPart): TPart => {
    const runtime = useOptionalDatasetControlInternal();
    //provided as it is made: a part can be read before the first effect, such as the grid before AG Grid mounts
    const [part, remove] = useMemo(() => {
        const created = create();
        return [created, runtime?.services.provide(name, created)] as const;
    }, []);
    //a replacing part provides itself before this one unmounts, and the remover leaves it be
    useEffect(() => () => remove?.(), []);
    return part;
};
