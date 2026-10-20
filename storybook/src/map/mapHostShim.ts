/**
 * A stand-in for the bits of the Dataverse host a story needs.
 *
 * Storybook is not a model-driven app, so `Xrm` is not there - and the features that reach for it (a card
 * button running `ExecuteFunction`, a pin icon coming from a web resource) would otherwise have nothing to
 * demonstrate. This installs just enough of it, and hands back what the control asked it to run so a story
 * can show it on screen. Nothing here ships in the package.
 */
export interface IExecutedFunction {
    webResourceName: string
    functionName: string
    args: any[]
}

export interface IMapHostShim {
    /** Everything the control has asked the host to run, oldest first. */
    executed: IExecutedFunction[]
    /** Puts the real `Xrm` back, or removes the stand-in when there was none. */
    restore: () => void
}

export interface IMapHostShimOptions {
    /** Called whenever the control runs a function, so a story can re-render its readout. */
    onExecute?: (executed: IExecutedFunction) => void
    /** Answers `getWebResourceUrl`, for pin icons and legends that name a web resource. */
    getWebResourceUrl?: (webResourceName: string) => string
}

export const installMapHostShim = (options: IMapHostShimOptions = {}): IMapHostShim => {
    const executed: IExecutedFunction[] = []
    const previous = (window as any).Xrm

    ;(window as any).Xrm = {
        ...previous,
        Utility: {
            ...previous?.Utility,
            getGlobalContext: () => ({
                getWebResourceUrl: (webResourceName: string) =>
                    options.getWebResourceUrl?.(webResourceName) ?? `/webresources/${webResourceName}`
            }),
            //the real one calls the function inside the web resource, passing resolve and reject first
            executeFunction: async (webResourceName: string, functionName: string, args: any[]) => {
                const [resolve, , ...rest] = args ?? []
                const entry = { webResourceName, functionName, args: rest }
                executed.push(entry)
                options.onExecute?.(entry)
                if (typeof resolve === 'function') {
                    resolve(entry)
                }
            }
        }
    }

    return {
        executed,
        restore: () => {
            if (previous) {
                ;(window as any).Xrm = previous
                return
            }
            delete (window as any).Xrm
        }
    }
}
