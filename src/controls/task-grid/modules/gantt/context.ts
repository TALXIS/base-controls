import * as React from "react";
import { useServices } from "@components/TaskGrid/context";
import { IGanttServiceMap } from "./services";

/**
 * The Gantt module itself.
 * @throws When the module is not registered, which is also when nothing in here should be rendering.
 */
export const useGanttModule = () => {
    return useServices().get('ganttModule');
};

/** Where everything the module holds is reached, the grid's own services included. */
export const useGanttServices = () => {
    return useGanttModule().services;
};

/** How the timeline is set up on the view that is open. */
export const useGanttViewState = () => {
    return useGanttServices().get('ganttViewState');
};

/** The Gantt's replaceable components, as the module resolved them. */
export const useGanttComponents = () => {
    return useGanttServices().get('components');
};

/** Resolves the Gantt's own strings. */
export const useGanttLabels = () => {
    return useGanttServices().get('labels');
};

/**
 * The service once something registers it, and a re-render when that happens — `undefined` until then.
 *
 * How the timeline's UI waits for the chart: the manager registers the chart's parts only after
 * `gantt.init`, so a part that resolves is a part that can be used.
 */
export const useGanttService = <TKey extends keyof IGanttServiceMap>(key: TKey): IGanttServiceMap[TKey] | undefined => {
    const services = useGanttServices();
    const [service, setService] = React.useState(() => services.find(key));

    React.useEffect(() => {
        if (service !== undefined) {
            return;
        }
        //there is no unsubscribing from whenAvailable, so a callback that outlives the component simply
        //stops writing to it
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

    return service;
};
