import { useCallback, useMemo, useRef } from 'react';
import { IRecord } from '@talxis/client-libraries';
import { IMapLocation, IMapProviderProps } from '../providers/provider';
import {
    IMapModule,
    IMapModuleContext,
    IMapModules,
    IMapModuleState,
    IMapOverlayItem,
    IMapPins,
    IMapPinsContext,
    IMapStatusMessage,
    IMapViewContext,
    MAP_MODULE_ORDER
} from '../modules/interfaces';

/** A module and the slot it fills, in the order the core runs them. */
export interface IMapModuleEntry {
    key: keyof IMapModules;
    module: IMapModule;
}

/** The modules a map runs with, in `MAP_MODULE_ORDER`. Absent keys are left out rather than carried as gaps. */
export const getMapModuleEntries = (modules?: IMapModules): IMapModuleEntry[] =>
    MAP_MODULE_ORDER
        .map((key) => ({ key, module: modules?.[key] }))
        .filter((entry): entry is IMapModuleEntry => !!entry.module);

/**
 * What identifies a set of modules for the rules of hooks: which slots are filled, and which stages each
 * one implements. The core remounts its inner tree when this changes, so every stage hook below is called
 * the same number of times on every render of one mount.
 */
export const getMapModulesKey = (entries: IMapModuleEntry[]): string =>
    entries.map(({ key, module }) => `${key}:${STAGES.filter((stage) => !!module[stage]).join(',')}`).join('|');

const STAGES: (keyof IMapModule)[] = [
    'useModuleState',
    'useRecords',
    'usePins',
    'useDrawnLocations',
    'useProviderProps',
    'useOverlay',
    'useStatus'
];

/**
 * The store the modules publish into, and the `read` every stage context carries. One per mount.
 */
export const useMapModuleStore = () => {
    const stateRef = useRef<{ [key: string]: IMapModuleState | undefined }>({});
    const read = useCallback(<TState extends IMapModuleState>(module: keyof IMapModules) =>
        stateRef.current[module] as TState | undefined, []);
    return { stateRef, read };
};

/** Runs every module's `useModuleState` and publishes what came back. Returns the states in module order. */
export const useMapModuleStates = (
    entries: IMapModuleEntry[],
    store: ReturnType<typeof useMapModuleStore>,
    context: IMapModuleContext
): IMapModuleState[] => {
    //cleared up front, so a module reads nothing stale from a sibling that stopped publishing
    const states: IMapModuleState[] = [];
    entries.forEach(({ key, module }) => {
        //the set of modules implementing this stage is fixed per mount, which is what makes the conditional call legal
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const state = module.useModuleState ? module.useModuleState(context) : {};
        store.stateRef.current[key] = state;
        states.push(state);
    });
    return states;
};

/** Runs every module's `useRecords` in order, each on what the one before returned. */
export const useMapModuleRecords = (entries: IMapModuleEntry[], records: IRecord[], context: IMapModuleContext): IRecord[] =>
    entries.reduce((current, { module }) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        (module.useRecords ? module.useRecords(current, context) : current), records);

/** Runs every module's `usePins` in order, each on what the one before returned. */
export const useMapModulePins = (entries: IMapModuleEntry[], pins: IMapPins, context: IMapPinsContext): IMapPins =>
    entries.reduce((current, { module }) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        (module.usePins ? module.usePins(current, context) : current), pins);

/** Runs every module's `useDrawnLocations` in order, each on what the one before returned. */
export const useMapModuleDrawnLocations = (entries: IMapModuleEntry[], locations: IMapLocation[], context: IMapViewContext): IMapLocation[] =>
    entries.reduce((current, { module }) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        (module.useDrawnLocations ? module.useDrawnLocations(current, context) : current), locations);

/** Runs every module's `useProviderProps` in order, each on what the one before returned. */
export const useMapModuleProviderProps = (entries: IMapModuleEntry[], props: IMapProviderProps, context: IMapViewContext): IMapProviderProps =>
    entries.reduce((current, { module }) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        (module.useProviderProps ? module.useProviderProps(current, context) : current), props);

/** Collects every module's chrome, in module order. */
export const useMapModuleOverlays = (entries: IMapModuleEntry[], context: IMapViewContext): IMapOverlayItem[] => {
    const items: IMapOverlayItem[] = [];
    entries.forEach(({ module }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const contributed = module.useOverlay ? module.useOverlay(context) : undefined;
        contributed?.forEach((item) => items.push(item));
    });
    return items;
};

/** Collects every module's status message. */
export const useMapModuleStatuses = (entries: IMapModuleEntry[], context: IMapViewContext): IMapStatusMessage[] => {
    const messages: IMapStatusMessage[] = [];
    entries.forEach(({ module }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const message = module.useStatus ? module.useStatus(context) : undefined;
        if (message) {
            messages.push(message);
        }
    });
    return messages;
};

/** The message that wins: highest priority, first module on a tie. */
export const pickMapStatus = (messages: IMapStatusMessage[]): IMapStatusMessage | undefined =>
    messages.reduce<IMapStatusMessage | undefined>((best, message) =>
        (!best || message.priority > best.priority ? message : best), undefined);

/** Sorts the chrome of one corner by its `order`, keeping module order among equals. */
export const useMapOverlayItems = (items: IMapOverlayItem[]) =>
    useMemo(() => {
        const byPosition: { [position: string]: IMapOverlayItem[] } = {};
        items.forEach((item) => {
            (byPosition[item.position] ??= []).push(item);
        });
        Object.values(byPosition).forEach((corner) => corner.sort((left, right) => left.order - right.order));
        return byPosition;
    }, [items]);
