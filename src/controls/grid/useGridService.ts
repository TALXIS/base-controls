import { useContext, useEffect, useState } from "react";
import { IGridDeferredService, IGridServiceMapInternal, IGridServiceLocator, IGridServiceMap } from "./runtime";
import { GridServicesContext } from "./context";

/** The grid's services, typed with a module's own map to reach what that module adds. */
export const useGridServices = <TServices extends IGridServiceMap = IGridServiceMap>(): IGridServiceLocator<TServices> => {
    return useContext(GridServicesContext) as unknown as IGridServiceLocator<TServices>;
};

/** Reads one of the grid's services by name, inside anything the grid draws. */
export const useGridService = <TKey extends keyof IGridServiceMap>(key: TKey):
    TKey extends IGridDeferredService ? IGridServiceMap[TKey] | undefined : IGridServiceMap[TKey] => {
    return useGridServiceInternal(key as keyof IGridServiceMapInternal) as any;
};

//the grid's own parts read the internal side of the services
export const useGridServiceInternal = <TKey extends keyof IGridServiceMapInternal>(key: TKey):
    TKey extends IGridDeferredService ? IGridServiceMapInternal[TKey] | undefined : IGridServiceMapInternal[TKey] => {
    const services = useContext(GridServicesContext);
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
