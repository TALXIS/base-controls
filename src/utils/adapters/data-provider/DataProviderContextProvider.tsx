import { IDataProvider } from "@talxis/client-libraries";
import { DataProviderContext } from "./context";

export interface IDataProviderContextProviderProps {
    provider: IDataProvider;
    children?: React.ReactNode;
}

/** Hands the provider to every grid and dataset part below it. */
export const DataProviderContextProvider = (props: IDataProviderContextProviderProps) => <DataProviderContext.Provider value={props.provider}>
    {props.children}
</DataProviderContext.Provider>;
