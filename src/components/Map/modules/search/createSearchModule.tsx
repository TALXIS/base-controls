import { IMapModule, IMapOverlayItem, IMapViewContext, MAP_OVERLAY_ORDER } from '../interfaces';
import { useModuleLabels } from '../useModuleLabels';
import { IMapSearchComponents, MapSearchComponents } from './components';
import { IMapSearchTranslations, searchLabels } from './labels';
import { useSearch } from './useSearch';

/** Options for {@link createSearchModule}. */
export interface IMapSearchModuleOptions {
    /**
     * Whether the box also offers places from the geo-coding service, which move the map without filtering
     * the records. On by default; does nothing when no configured provider has a geo-coding service.
     */
    places?: boolean;
    /** Zoom the map moves to when a place is picked. Defaults to a street level view. */
    placeZoom?: number;
    /** Overrides for any subset of the module's strings. */
    labels?: IMapSearchTranslations;
    /** Replaces any subset of the module's UI. Anything omitted keeps what the module ships. */
    components?: Partial<IMapSearchComponents>;
}

/** Zoom the map moves to when a place is picked out of the suggestions. */
const DEFAULT_PLACE_ZOOM = 15;

/** Where the box sits among the top-left chrome: above the status message. */
const SEARCH_ORDER = MAP_OVERLAY_ORDER.status - 10;

/**
 * Builds the search module: one box, two searches. Committing what is typed runs the entity's quick find
 * over the bound dataset, which filters the records and so the pins; the geo-coding service also offers
 * places, which move the map without touching the dataset.
 *
 * A map inside `DatasetControl` already has quick find in that control's header, which is why this is a
 * module rather than part of the core.
 *
 * Assign it to `modules.search`:
 *
 * @example
 * ```ts
 * modules={{ search: createSearchModule() }}
 * modules={{ search: createSearchModule({ places: false }) }}
 * ```
 */
export const createSearchModule = (options: IMapSearchModuleOptions = {}): IMapModule => {
    const { places = true, placeZoom = DEFAULT_PLACE_ZOOM } = options;
    const components = { ...MapSearchComponents, ...options.components };

    return {
        useOverlay: (context: IMapViewContext): IMapOverlayItem[] | undefined => {
            const labels = useModuleLabels(context, searchLabels, options.labels);
            const search = useSearch({
                dataset: context.dataset,
                geocoder: context.geocoder,
                enableAddressSearch: places,
                language: context.language
            });
            return [{
                position: 'top-left',
                order: SEARCH_ORDER,
                element: components.onRenderSearchBox({
                    query: search.query,
                    suggestions: search.suggestions,
                    isSuggesting: search.isSuggesting,
                    searchedColumnNames: search.quickFindColumns.map((column) => column.displayName ?? column.name),
                    labels,
                    theme: context.theme,
                    onQueryChange: search.onQueryChange,
                    onSearch: search.onSearch,
                    onSelectPlace: (place) => context.onFocusViewport({
                        center: place.coordinates,
                        zoom: placeZoom,
                        padding: context.viewport.padding
                    })
                })
            }];
        }
    };
};
