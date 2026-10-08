import { useContext, useEffect, useState } from "react";
import { IGridDeferredService, IGridServiceLocator, IGridServiceMap } from "./services";
import { GridServicesContext } from "./context";

/** The grid's services, typed with a module's own map to reach what that module adds. */
export const useGridServices = <TServices extends IGridServiceMap = IGridServiceMap>(): IGridServiceLocator<TServices> => {
    return useContext(GridServicesContext) as IGridServiceLocator<TServices>;
};

/** Reads one of the grid's services by name. */
export const useGridService = <TKey extends keyof IGridServiceMap>(key: TKey):
    TKey extends IGridDeferredService ? IGridServiceMap[TKey] | undefined : IGridServiceMap[TKey] => {
    const services = useContext(GridServicesContext);
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
