import { PcfContext } from "./context";
import { PcfContextFactory } from "./factory/PcfContextFactory";

interface IPcfContextProviderProps {
    context?: ComponentFramework.Context<any, any>;
    userSettings?: {
        lcid?: number;
        formatInfoCultureName?: string;
    };
    children?: React.ReactNode;
}

/**
 * Provides a PCF context to descendants, reusing the supplied base context or
 * creating a sample context through the local factory adapter. When no Xrm
 * context exists, optional fallback user settings can be supplied for the
 * sample context.
 */
export const PcfContextProvider = (props: IPcfContextProviderProps) => {
    const { context: baseContext, userSettings } = props;

    const context = PcfContextFactory.createContext({
        baseContext: baseContext,
        userSettings,
    });
    return <PcfContext.Provider value={context}>
        {props.children}
    </PcfContext.Provider>
}