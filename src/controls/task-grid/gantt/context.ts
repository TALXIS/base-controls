import { createContext, useEffect, useMemo, useState } from "react";
import { useContextWithNullCheck } from "@core";
import type { IGantt, IGanttDeferredService, IGanttModuleMap, IGanttServiceMap } from "./interfaces";

export const GanttContext = createContext<IGantt | null>(null);

GanttContext.displayName = "GanttContext";

/** The Gantt of the enclosing `TaskGantt`, throwing outside one. */
export const useGantt = (): IGantt => useContextWithNullCheck(GanttContext);

/** The module the enclosing `TaskGantt` loaded under `name`, throwing when absent. */
export const useGanttModule = <TName extends keyof IGanttModuleMap>(name: TName): IGanttModuleMap[TName] => {
    return useGantt().modules.get(name);
};

/** Reads one of the Gantt's services by name, inside anything the Gantt draws. */
export const useGanttService = <TKey extends keyof IGanttServiceMap>(key: TKey):
    TKey extends IGanttDeferredService ? IGanttServiceMap[TKey] | undefined : IGanttServiceMap[TKey] => {
    const services = useGantt().services;
    const [service, setService] = useState(() => services.find(key));

    useEffect(() => {
        if (service !== undefined) {
            return;
        }
        return services.observe(key, setService);
    }, []);

    //the conditional return type is the caller's contract
    return service as any;
};

/** Creates a service once and provides it on the Gantt while the calling component is mounted. */
export const useProvideGanttService = <TKey extends keyof IGanttServiceMap, TService extends IGanttServiceMap[TKey]>(key: TKey, create: () => TService): TService => {
    const services = useGantt().services;
    //provided as it is made: the modules load after the first render and may read it
    const [service, remove] = useMemo(() => {
        const created = create();
        return [created, services.provide(key, created)] as const;
    }, []);
    useEffect(() => remove, []);
    return service;
};
