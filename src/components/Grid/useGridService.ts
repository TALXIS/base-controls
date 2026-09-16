import { useContext, useEffect, useState } from "react";
import { IGridServiceMap, IOptionalGridService } from "./services";
import { GridServicesContext } from "./context";

/** What a grid is made of, by name — the one way a component reaches any of it. */
export const useGridService = <TKey extends keyof IGridServiceMap>(key: TKey):
    TKey extends IOptionalGridService ? IGridServiceMap[TKey] | undefined : IGridServiceMap[TKey] => {
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

    //the conditional return type is the caller's contract; inside here the value is just
    return service as any;
};
