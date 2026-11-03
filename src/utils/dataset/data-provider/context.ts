import React from "react";
import { IDataProvider } from "@talxis/client-libraries";

/** The provider the components inside it work on; `DatasetControl` provides it. */
export const DataProviderContext = React.createContext<IDataProvider | null>(null);

DataProviderContext.displayName = "DataProviderContext";

/**
 * Returns the provider from {@link DataProviderContext}.
 *
 * Throws outside `DataProviderScope` or a loaded `DatasetControl`.
 */
export const useDataProvider = (): IDataProvider => {
    const provider = React.useContext(DataProviderContext);
    if (!provider) {
        throw new Error('This component must be rendered within DataProviderScope, or inside a DatasetControl.');
    }
    return provider;
};
