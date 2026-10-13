import { useMemo, useReducer } from "react";
import { IDataProvider, IDataProviderEventListeners } from "@talxis/client-libraries";
import { useEventEmitter } from "@hooks";
import { useDataProvider } from "./context";

/**
 * Returns the provider from {@link DataProviderContext} and draws the component again on each of `events`.
 * @param events Read once, at mount.
 */
export const useDataProviderEvents = (events: (keyof IDataProviderEventListeners)[]): IDataProvider => {
    const provider = useDataProvider();
    const [, rerender] = useReducer((version: number) => version + 1, 0);
    //useEventEmitter subscribes again whenever the array changes identity
    const subscribedEvents = useMemo(() => events, []);
    useEventEmitter<IDataProviderEventListeners>(provider, subscribedEvents, rerender as IDataProviderEventListeners[keyof IDataProviderEventListeners]);
    return provider;
};
