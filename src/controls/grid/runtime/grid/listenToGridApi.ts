import type { AgPublicEventType, GridApi } from "ag-grid-community";
import type { IRecord } from "@talxis/client-libraries";

/** Adds the listeners to `gridApi`; what it returns removes them, unless the api is destroyed already. */
export const listenToGridApi = (gridApi: GridApi<IRecord>, listeners: { [TEvent in AgPublicEventType]?: (event: any) => void }): () => void => {
    const entries = Object.entries(listeners) as [AgPublicEventType, (event: any) => void][];
    entries.forEach(([event, listener]) => gridApi.addEventListener(event, listener));
    return () => {
        if (!gridApi.isDestroyed()) {
            entries.forEach(([event, listener]) => gridApi.removeEventListener(event, listener));
        }
    };
};
