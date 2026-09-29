import { IRecord } from '@talxis/client-libraries';
import { IMapModule, IMapModuleContext, IMapModuleState, IMapOverlayItem, IMapViewContext, MAP_OVERLAY_ORDER } from '../interfaces';
import { useModuleLabels } from '../useModuleLabels';
import { IMapFilterComponents, MapFilterComponents } from './components';
import { filterLabels, IMapFilterTranslations } from './labels';
import { IMapFilterMode } from './mapFilters';
import { IFilteringState, useFiltering } from './useFiltering';

/** Options for {@link createFilterModule}. */
export interface IMapFilterModuleOptions {
    /**
     * Attributes the panel offers. Each becomes a list of the values the loaded records actually hold, with
     * a count. Dot notation reaches across a lookup.
     */
    attributes: string[];
    /**
     * Where a pick applies: `map` narrows what this map draws and works on any provider; `dataset` pushes
     * the filter to the bound dataset so every control sharing it follows. Defaults to `map`.
     */
    scope?: 'map' | 'dataset';
    /** Overrides for any subset of the module's strings. */
    labels?: IMapFilterTranslations;
    /** Replaces any subset of the module's UI. Anything omitted keeps what the module ships. */
    components?: Partial<IMapFilterComponents>;
}

/** Where the panel sits among the top-left chrome: under the status message. */
const FILTER_ORDER = MAP_OVERLAY_ORDER.status + 10;

const MODES: { [scope in NonNullable<IMapFilterModuleOptions['scope']>]: IMapFilterMode } = {
    map: 'pins',
    dataset: 'dataset'
};

/**
 * Builds the filter module: a panel listing the values the records hold for the attributes named, to
 * narrow the pins by. Values within one attribute widen the result and attributes narrow it - "depots or
 * stores, in Brno".
 *
 * Assign it to `modules.filter`:
 *
 * @example
 * ```ts
 * modules={{ filter: createFilterModule({ attributes: ['category', 'city'] }) }}
 * ```
 */
export const createFilterModule = (options: IMapFilterModuleOptions): IMapModule => {
    const { attributes, scope = 'map' } = options;
    const components = { ...MapFilterComponents, ...options.components };
    //what the records stage worked out, for the overlay stage of the same render - the stages run in order
    //within one render, so this never carries a value from one render into the next
    let filtering: IFilteringState | undefined;

    return {
        useModuleState: (): IMapModuleState => ({ attributePaths: attributes }),

        useRecords: (records: IRecord[], context: IMapModuleContext): IRecord[] => {
            filtering = useFiltering({ dataset: context.dataset, records, attributes, mode: MODES[scope] });
            return filtering.records;
        },

        useOverlay: (context: IMapViewContext): IMapOverlayItem[] | undefined => {
            const labels = useModuleLabels(context, filterLabels, options.labels);
            if (!filtering?.facets.length) {
                return undefined;
            }
            return [{
                position: 'top-left',
                order: FILTER_ORDER,
                element: components.onRenderFilterPanel({
                    facets: filtering.facets,
                    selection: filtering.selection,
                    labels,
                    theme: context.theme,
                    onToggle: filtering.onToggle,
                    onClear: filtering.onClear
                })
            }];
        }
    };
};
