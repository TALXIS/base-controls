import { IMapModule, IMapModuleContext, IMapModuleState } from '../interfaces';
import { useClientApi } from './useClientApi';

/** Options for {@link createClientApiModule}. Both are needed for anything to run. */
export interface IMapClientApiModuleOptions {
    /** Web resource holding the Client API function. */
    webResourceName?: string;
    /** Function inside that web resource. */
    functionName?: string;
}

/**
 * Builds the Client API module: runs a web resource a customizer wrote, for pin rules configuration cannot
 * express - anything that has to look at a related record, compute a value, or decide in JavaScript. The
 * function is called once with the dataset and the registration methods, exactly as the dataset control's
 * own Client API is, so a customizer writes the same kind of web resource for both.
 *
 * Assign it to `modules.clientApi`:
 *
 * @example
 * ```ts
 * modules={{ clientApi: createClientApiModule({ webResourceName: 'ntg_map.js', functionName: 'TALXIS.Map.onLoad' }) }}
 * ```
 *
 * The web resource registers what it wants to decide:
 *
 * ```js
 * TALXIS.Map.onLoad = (api) => api.setPinResolver((record) => record.getValue('ntg_urgent') ? { color: '#c50f1f' } : undefined);
 * ```
 */
export const createClientApiModule = (options: IMapClientApiModuleOptions): IMapModule => {
    const { webResourceName, functionName } = options;

    return {
        useModuleState: (context: IMapModuleContext): IMapModuleState => {
            const clientApi = useClientApi({ webResourceName, functionName, dataset: context.dataset });
            return { resolvePin: clientApi.resolvePin };
        }
    };
};
