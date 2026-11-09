import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@fluentui/react';
import { executeFunctionAsync, IRecord } from '@talxis/client-libraries';
import { IContext } from '@interfaces';
import { ITheme } from '@legacy';
import {
    DEFAULT_MAP_CARD,
    getMapCardDefinition,
    IMapCardAction,
    IMapCardDefinition,
    IMapCardRenderers,
    IMapCardRule,
    IMapClusterMemberRenderer
} from './cards';
import { DEFAULT_MAP_CARD_RENDERERS } from './map-card';
import { MapClusterCard } from './map-cluster-card';
import { IMapLocation, IMapOpenCard } from '../../providers/provider';
import { IMapCardsLabels } from './labels';

export interface IUseCards {
    /** Records currently drawn, so a pin can be traced back to the record behind it. */
    records: IRecord[];
    /** Every pin the records produced, so a grouped pin's list can show each member's own pin. */
    locations: IMapLocation[];
    /** Card rules from the `Cards` parameter. */
    rules: IMapCardRule[];
    /** The card used when no rule applies. */
    fallback?: IMapCardDefinition;
    /** Renderers on top of the built-in ones, keyed by card type. */
    renderers?: IMapCardRenderers;
    /** Renders one row of a grouped pin's list, instead of the default pin and name. */
    onRenderClusterMember?: IMapClusterMemberRenderer;
    context: IContext;
    theme: ITheme;
    labels: IMapCardsLabels;
    /** Zooms the map to where a group comes apart, for the button on a grouped card. */
    onZoomToCluster: (location: IMapLocation) => void;
    /** Deletes a record the map created, offered as a button on its card. */
    onDeleteLocation?: (location: IMapLocation) => void;
    /** Ids of the records the map created, which are the only ones it offers to delete. */
    deletableRecordIds?: string[];
}

export interface ICardsState {
    /** The one card that is open, ready to hand to the provider. */
    openCard?: IMapOpenCard;
    /** Opens the card for a pin, or runs the function its rules chose instead of showing one. */
    onOpenCard: (location: IMapLocation) => void;
    onCloseCard: () => void;
}

/** Runs a card's button. */
const executeCardAction = (action: IMapCardAction, record: IRecord) => {
    //@ts-ignore - executeFunction is missing from @types/xrm
    if (typeof window.Xrm?.Utility?.executeFunction !== 'function') {
        console.warn(`Map: the card action "${action.functionName}" needs a host that provides Xrm, so nothing ran.`);
        return;
    }
    executeFunctionAsync(action.webResourceName, action.functionName, [{ recordId: record.getRecordId(), record }])
        .catch((error) => console.error(
            `Map: the card action "${action.functionName}" in "${action.webResourceName}" failed:`, error
        ));
};

/**
 * Owns what happens when a pin is activated.
 *
 * One card is open at a time, enforced by holding a single open pin rather than by asking providers to close
 * each other's. A grouped pin opens `MapClusterCard`, which owns which of its members is picked.
 */
export const useCards = (props: IUseCards): ICardsState => {
    const {
        records,
        locations,
        rules,
        fallback,
        renderers,
        onRenderClusterMember,
        context,
        theme,
        labels,
        onZoomToCluster,
        onDeleteLocation,
        deletableRecordIds
    } = props;
    const [openLocation, setOpenLocation] = useState<IMapLocation>();

    const recordsById = useMemo(
        () => new Map(records.map((record) => [record.getRecordId(), record])),
        [records]
    );
    const locationsById = useMemo(
        () => new Map(locations.filter((location) => !location.cluster).map((location) => [location.id, location])),
        [locations]
    );
    const allRenderers = useMemo(() => ({ ...DEFAULT_MAP_CARD_RENDERERS, ...renderers }), [renderers]);
    const getDefinition = useCallback(
        (record: IRecord) => getMapCardDefinition(record, rules, fallback ?? DEFAULT_MAP_CARD),
        [rules, fallback]
    );

    const onCloseCard = useCallback(() => setOpenLocation(undefined), []);

    //nothing renders for a pin that is gone, so the open pin is dropped rather than left hanging in state
    useEffect(() => {
        setOpenLocation((current) => (
            current && !current.cluster && !recordsById.has(current.id) ? undefined : current
        ));
    }, [recordsById]);

    const getClusterRecords = useCallback((location: IMapLocation): IRecord[] =>
        (location.cluster?.recordIds ?? [])
            .map((recordId) => recordsById.get(recordId))
            .filter((record): record is IRecord => !!record),
    [recordsById]);

    const deletableIds = useMemo(() => new Set(deletableRecordIds ?? []), [deletableRecordIds]);

    const renderRecordCard = useCallback((record: IRecord | undefined, location: IMapLocation): ReactNode => {
        //the record can go while its card is open - a search or a filter narrows the dataset under it
        if (!record) {
            return null;
        }
        const definition = getDefinition(record);
        const renderer = allRenderers[definition.type];
        if (!renderer) {
            console.warn(`Map: no renderer is registered for the card type "${definition.type}".`);
            return null;
        }
        return renderer({
            record,
            location,
            definition,
            context,
            theme,
            labels,
            onExecuteAction: (action) => executeCardAction(action, record),
            onDelete: onDeleteLocation && deletableIds.has(record.getRecordId())
                ? () => {
                    onDeleteLocation({ ...location, id: record.getRecordId() });
                    onCloseCard();
                }
                : undefined,
            onClose: onCloseCard
        });
    }, [allRenderers, getDefinition, context, theme, labels, onCloseCard, onDeleteLocation, deletableIds]);

    const onOpenCard = useCallback((location: IMapLocation) => {
        if (location.cluster) {
            setOpenLocation(getClusterRecords(location).length ? location : undefined);
            return;
        }
        const record = recordsById.get(location.id);
        if (!record) {
            return;
        }
        const definition = getDefinition(record);
        //a function card shows nothing - running the web resource is the whole reaction to the click
        if (definition.type === 'function') {
            if (definition.webResourceName && definition.functionName) {
                executeCardAction({
                    label: definition.functionName,
                    webResourceName: definition.webResourceName,
                    functionName: definition.functionName
                }, record);
            } else {
                console.warn('Map: a card of type "function" needs both webResourceName and functionName.');
            }
            setOpenLocation(undefined);
            return;
        }
        setOpenLocation(definition.type === 'none' ? undefined : location);
    }, [recordsById, getDefinition, getClusterRecords]);

    const openCard = useMemo<IMapOpenCard | undefined>(() => {
        if (!openLocation) {
            return undefined;
        }
        //a card whose record has left the dataset closes rather than renders half of itself
        if (!openLocation.cluster && !recordsById.has(openLocation.id)) {
            return undefined;
        }
        const getMemberLocation = (record: IRecord) => locationsById.get(record.getRecordId());
        //a member's card is rendered as its own pin's, not the group's - falling back to the group's
        //coordinates for a record the map could not place on its own
        const renderMemberCard = (record: IRecord) => renderRecordCard(
            record,
            getMemberLocation(record) ?? { ...openLocation, id: record.getRecordId(), cluster: undefined }
        );
        const content = openLocation.cluster
            ? <MapClusterCard
                cluster={openLocation.cluster}
                records={getClusterRecords(openLocation)}
                labels={labels}
                theme={theme}
                onGetMemberLocation={getMemberLocation}
                onRenderMember={onRenderClusterMember}
                onRenderRecordCard={renderMemberCard}
                onZoomIn={() => {
                    onZoomToCluster(openLocation);
                    onCloseCard();
                }} />
            : renderRecordCard(recordsById.get(openLocation.id), openLocation);
        if (!content) {
            return undefined;
        }
        return {
            locationId: openLocation.id,
            coordinates: { latitude: openLocation.latitude, longitude: openLocation.longitude },
            //a popup is the vendor's DOM, outside the control's tree - the card is themed here so anything
            //inside it reading the Fluent theme (a Form, a Text) gets the control's rather than the default
            content: <ThemeProvider theme={theme} applyTo='none'>{content}</ThemeProvider>
        };
    }, [openLocation, recordsById, locationsById, renderRecordCard, getClusterRecords, onRenderClusterMember, labels, theme, onZoomToCluster, onCloseCard]);

    return { openCard, onOpenCard, onCloseCard };
};
