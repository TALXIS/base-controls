import { IMapModule, IMapOverlayItem, IMapViewContext, MAP_OVERLAY_ORDER } from '../interfaces';
import { useModuleLabels } from '../useModuleLabels';
import { IMapLegendComponents, MapLegendComponents } from './components';
import { IMapLegendTranslations, legendLabels } from './labels';
import { useLegendHtml } from './useLegendHtml';

/** Options for {@link createLegendModule}. Give it `html`, `webResourceName`, or both. */
export interface IMapLegendModuleOptions {
    /**
     * Legend markup. Cleaned before it is inserted: scripts, event handlers and anything that can load or
     * submit are removed, while formatting, tables, images and inline SVG survive.
     */
    html?: string;
    /** Web resource holding that markup instead. Wins over `html` once it loads. */
    webResourceName?: string;
    /** Overrides for any subset of the module's strings. */
    labels?: IMapLegendTranslations;
    /** Replaces any subset of the module's UI. Anything omitted keeps what the module ships. */
    components?: Partial<IMapLegendComponents>;
}

/** Where the legend sits among the top-right chrome: after the provider picker. */
const LEGEND_ORDER = MAP_OVERLAY_ORDER.providerPicker + 10;

/**
 * Builds the legend module: a collapsible key to the pins, drawn over the map beside the provider picker.
 *
 * Assign it to `modules.legend`:
 *
 * @example
 * ```ts
 * modules={{ legend: createLegendModule({ html: '<ul><li>Red: depot</li></ul>' }) }}
 * modules={{ legend: createLegendModule({ webResourceName: 'ntg_map_legend.html' }) }}
 * ```
 */
export const createLegendModule = (options: IMapLegendModuleOptions): IMapModule => {
    const { html, webResourceName } = options;
    const components = { ...MapLegendComponents, ...options.components };

    return {
        useOverlay: (context: IMapViewContext): IMapOverlayItem[] | undefined => {
            const labels = useModuleLabels(context, legendLabels, options.labels);
            const resolved = useLegendHtml({ html, webResourceName });
            if (!resolved) {
                return undefined;
            }
            return [{
                position: 'top-right',
                order: LEGEND_ORDER,
                element: components.onRenderLegend({ html: resolved, labels, theme: context.theme })
            }];
        }
    };
};
