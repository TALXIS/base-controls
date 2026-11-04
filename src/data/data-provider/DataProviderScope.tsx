import { IDataProvider } from "@talxis/client-libraries";
import { DataProviderContext } from "./context";

export interface IDataProviderScopeProps {
    provider: IDataProvider;
    children?: React.ReactNode;
}

/** Hands the provider to every grid and dataset part below it. */
export const DataProviderScope = (props: IDataProviderScopeProps) => <DataProviderContext.Provider value={props.provider}>
    {props.children}
</DataProviderContext.Provider>;
