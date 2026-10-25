import { createContext, useEffect, useMemo, useState } from "react";
import { useContextWithNullCheck } from "@utils";
import type { IGantt, IGanttDeferredService, IGanttModuleMap, IGanttServiceMap } from "./interfaces";

export const GanttContext = createContext<IGantt | null>(null);

GanttContext.displayName = "GanttContext";

/** The Gantt of the enclosing `TaskGantt`; throws outside one. */
export const useGantt = (): IGantt => useContextWithNullCheck(GanttContext);

/** The module the enclosing `TaskGantt` loaded under `name`; throws when it is not loaded. */
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
        //there is no unsubscribing from whenAvailable
        let isMounted = true;
        services.whenAvailable(key, resolved => {
            if (isMounted) {
                setService(resolved);
            }
        });
        return () => {
            isMounted = false;
        };
    }, []);

    //the conditional return type is the caller's contract
    return service as any;
};

/** Creates a service once and registers it on the Gantt while the calling component is mounted. */
export const useCreateGanttService = <TKey extends keyof IGanttServiceMap, TService extends IGanttServiceMap[TKey]>(key: TKey, onCreate: () => TService): TService => {
    const services = useGantt().services;
    //registered as it is made: the modules load after the first render and may read it
    const service = useMemo(() => {
        const created = onCreate();
        services.register(key, () => created);
        return created;
    }, []);
    useEffect(() => () => {
        if (services.find(key) as unknown === service) {
            services.unregister(key);
        }
    }, []);
    return service;
};
