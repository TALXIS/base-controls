import { useContext, useEffect, useState } from "react";
import { IGridServiceMap, IOptionalGridService } from "../services";
import { GridServicesContext } from "./GridServicesContext";

/**
 * What a grid is made of, by name — the one way a component reaches any of it.
 *
 * The return type says whether it can be missing: a module's service and the AG Grid api come back
 * `undefined` until they are registered, and everything else is there before anything renders. So a
 * feature is `if (!sorting) return` and the grid itself simply resolves.
 *
 * A service that is not there yet is waited for, and its arrival re-renders — which is how a part of the
 * UI that needs the api can render before there is one.
 */
export const useGridService = <TKey extends keyof IGridServiceMap>(key: TKey):
    TKey extends IOptionalGridService ? IGridServiceMap[TKey] | undefined : IGridServiceMap[TKey] => {
    const services = useContext(GridServicesContext);
    const [service, setService] = useState(() => services.find(key));

    useEffect(() => {
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

    //the conditional return type is the caller's contract; inside here the value is just possibly-undefined
    return service as any;
};
