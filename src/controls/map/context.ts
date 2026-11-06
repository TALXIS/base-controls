import React from "react";
import { IDataProviderEventListeners, IRecord } from "@talxis/client-libraries";
import { useContextWithNullCheck, useEventEmitter, useRerender } from "@core";
import type { IMap } from "./runtime/MapRuntime";
import type { IMapModuleMap } from "./interfaces";

export const MapContext = React.createContext<IMap | null>(null);

MapContext.displayName = "MapContext";

export const MapRecordContext = React.createContext<IRecord | null>(null);

MapRecordContext.displayName = "MapRecordContext";

/** The `Map` the component is inside of; throws outside one. */
export const useMap = (): IMap => useContextWithNullCheck(MapContext);

/** One of the map's modules by name, inside anything the map draws; throws if it was not given. */
export const useMapModule = <TName extends keyof IMapModuleMap>(name: TName): IMapModuleMap[TName] => useMap().modules.get(name);

/** The record of the pin being drawn; throws outside a pin. */
export const useMapRecord = (): IRecord => useContextWithNullCheck(MapRecordContext);

/** The provider's records that have a position; rerenders when the provider loads new data. */
export const useMapRecords = (): IRecord[] => {
    const map = useMap();
    const provider = map.services.get('provider');
    const { rerender } = useRerender();
    useEventEmitter<IDataProviderEventListeners>(provider, 'onNewDataLoaded', rerender);
    return provider.getRecords().filter(record => map.getPoint(record));
};
