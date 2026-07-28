import { PcfContext } from "./context";
import { PcfContextFactory } from "./factory/PcfContextFactory";

interface IPcfContextProviderProps {
    context?: ComponentFramework.Context<any, any>;
    children?: React.ReactNode;
}

/**
 * Provides a PCF context to descendants, reusing the supplied base context or
 * creating a sample context through the local factory adapter.
 */
export const PcfContextProvider = (props: IPcfContextProviderProps) => {
    const { context: baseContext } = props;

    const context = PcfContextFactory.createContext({
        baseContext: baseContext
    });
    return <PcfContext.Provider value={context}>
        {props.children}
    </PcfContext.Provider>
}