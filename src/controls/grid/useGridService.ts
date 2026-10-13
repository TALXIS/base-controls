import { useContext, useEffect, useState } from "react";
import { IGridDeferredService, IGridInternalServiceMap, IGridServiceLocator, IGridServiceMap } from "./services";
import { GridServicesContext } from "./context";

/** The grid's services, typed with a module's own map to reach what that module adds. */
export const useGridServices = <TServices extends IGridServiceMap = IGridServiceMap>(): IGridServiceLocator<TServices> => {
    return useContext(GridServicesContext) as unknown as IGridServiceLocator<TServices>;
};

/** Reads one of the grid's services by name, inside anything the grid draws. */
export const useGridService = <TKey extends keyof IGridServiceMap>(key: TKey):
    TKey extends IGridDeferredService ? IGridServiceMap[TKey] | undefined : IGridServiceMap[TKey] => {
    return useGridInternalService(key as keyof IGridInternalServiceMap) as any;
};

//the grid's own parts read the internal side of the services
export const useGridInternalService = <TKey extends keyof IGridInternalServiceMap>(key: TKey):
    TKey extends IGridDeferredService ? IGridInternalServiceMap[TKey] | undefined : IGridInternalServiceMap[TKey] => {
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
