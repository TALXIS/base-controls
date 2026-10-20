import { useCallback, useMemo } from 'react';
import { IMapClickModifiers, IMapLocation, IMapProviderProps } from '../../providers/provider';
import { isSelectionOfCard } from '../../providers/pinStyle';
import { IMapModule, IMapViewContext } from '../interfaces';
import { useModuleLabels } from '../useModuleLabels';
import { DEFAULT_MAP_CARD, IMapCardDefinition, IMapCardRenderers, IMapCardRule } from './cards';
import { IMapCardsComponents, MapCardsComponents } from './components';
import { cardsLabels, IMapCardsTranslations } from './labels';
import { useCards } from './useCards';

/** Options for {@link createCardsModule}. Every one is optional; with none, a pin opens the record's fields. */
export interface IMapCardsModuleOptions {
    /**
     * Card rules, matched exactly like the pin rules: each says what activating a pin does - `fields`,
     * `adaptiveCard`, `function` or `none` - plus whatever that type needs, and the `attributeName` and
     * `value` a record must match for it. `parseMapCardRules` reads them out of JSON for a wrapper.
     */
    rules?: IMapCardRule[];
    /** The card every pin opens unless a rule says otherwise. Defaults to the record's fields. */
    defaultCard?: IMapCardDefinition;
    /**
     * Card renderers on top of the built-in ones, keyed by card type. This is how Adaptive Cards are added:
     * import `ADAPTIVE_MAP_CARD_RENDERERS` from `.../modules/cards/map-card/adaptive-card` and pass it here,
     * the way Google Maps is passed through `providers`. A type of your own is a renderer of your own.
     */
    renderers?: IMapCardRenderers;
    /** Replaces any subset of the module's UI. Anything omitted keeps what the module ships. */
    components?: Partial<IMapCardsComponents>;
    /** Overrides for any subset of the module's strings. */
    labels?: IMapCardsTranslations;
}

/**
 * Builds the cards module: what a pin opens when it is activated. One card is open at a time, anchored on
 * its pin by the provider; a grouped pin opens a list of the records behind it, and a record the editing
 * module created gets a delete button on its card.
 *
 * Assign it to `modules.cards`:
 *
 * @example
 * ```ts
 * modules={{ cards: createCardsModule() }}
 * modules={{
 *     cards: createCardsModule({
 *         defaultCard: { type: 'fields', columns: ['name', 'city'] },
 *         rules: [{ attributeName: 'category', value: 'depot', type: 'adaptiveCard', template }],
 *         renderers: ADAPTIVE_MAP_CARD_RENDERERS
 *     })
 * }}
 * ```
 */
export const createCardsModule = (options: IMapCardsModuleOptions = {}): IMapModule => {
    const { rules, defaultCard, renderers } = options;
    const components = { ...MapCardsComponents, ...options.components };

    return {
        useProviderProps: (props: IMapProviderProps, context: IMapViewContext): IMapProviderProps => {
            const { dataset, records, pins, theme, selectedRecordIds, onFocusViewport, visibleViewport } = context;
            const labels = useModuleLabels(context, cardsLabels, options.labels);
            const editing = context.read('editing');
            const cardRules = useMemo(() => rules ?? [], [rules]);

            const onZoomToCluster = useCallback((location: IMapLocation) => {
                onFocusViewport({
                    center: { latitude: location.latitude, longitude: location.longitude },
                    //relative to what the user is actually looking at, not what the control last asked for
                    zoom: location.cluster?.expansionZoom ?? visibleViewport.zoom + 2,
                    padding: context.viewport.padding
                });
            }, [onFocusViewport, context.viewport.padding, visibleViewport.zoom]);

            const cards = useCards({
                records,
                locations: pins.locations,
                rules: cardRules,
                fallback: defaultCard ?? DEFAULT_MAP_CARD,
                renderers,
                onRenderClusterMember: components.onRenderClusterMember,
                context: context.context,
                theme,
                labels,
                onZoomToCluster,
                onDeleteLocation: editing?.onDeleteLocation,
                deletableRecordIds: editing?.createdRecordIds
            });

            const coreOnLocationClick = props.onLocationClick;
            const onOpenCard = cards.onOpenCard;
            //a group has no record to select, so activating one opens the card listing what it stands for;
            //ctrl/cmd toggles the selection without opening a card, and a plain click selects and opens
            const onLocationClick = useCallback((location: IMapLocation, modifiers?: IMapClickModifiers) => {
                if (location.cluster) {
                    onOpenCard(location);
                    return;
                }
                coreOnLocationClick(location, modifiers);
                if (!modifiers?.ctrlKey && !modifiers?.metaKey) {
                    onOpenCard(location);
                }
            }, [coreOnLocationClick, onOpenCard]);

            //a plain click selected the record along with opening its card; closing the card the way the map
            //offers undoes both, so the pins the selection dimmed come back. A wider selection is never touched
            const openCardLocationId = cards.openCard?.locationId;
            const openCardRecordId = pins.locations.find((location) => location.id === openCardLocationId)?.recordId;
            const onCloseCard = cards.onCloseCard;
            const onCloseCardFromMap = useCallback(() => {
                if (isSelectionOfCard(openCardRecordId, selectedRecordIds)) {
                    dataset?.clearSelectedRecordIds();
                }
                onCloseCard();
            }, [openCardRecordId, selectedRecordIds, dataset, onCloseCard]);

            const openCard = cards.openCard;
            return useMemo(
                () => ({ ...props, openCards: openCard ? [openCard] : [], onLocationClick, onCloseCard: onCloseCardFromMap }),
                [props, openCard, onLocationClick, onCloseCardFromMap]
            );
        }
    };
};
