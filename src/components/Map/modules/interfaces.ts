import { ReactNode } from 'react';
import { IDataset, IRecord } from '@talxis/client-libraries';
import { IContext } from '@interfaces';
import { ITheme } from '@legacy';
import { IMapDirections } from '../core/directions';
import { IMapFallbackLocationResolver } from '../core/fallbackLocation';
import { IMapGeocoder } from '../core/geocoding';
import { IMapPinResolver } from '../core/pinAppearance';
import { IMapViewport, IMapViewportRequest } from '../core/viewport';
import { IMapCoordinates } from '../core/coordinates';
import { IMapLabels } from '../labels';
import { IMapLocation, IMapProviderProps, IMapRoute } from '../providers/provider';
import { IMapOutputs } from '../interfaces';

/**
 * The pins the core read off the records, and what a module may add to them.
 */
export interface IMapPins {
    /** One pin per record the core could place, in dataset order. */
    locations: IMapLocation[];
    /** Lines between pins. Empty until the routes module fills it. */
    routes: IMapRoute[];
    /**
     * Records no coordinates could be read from. The geocoding module may still place them; anything left
     * here after every module has run simply has nowhere to be drawn.
     */
    unplacedRecords: IRecord[];
    /**
     * Whether a module is still working on these pins - resolving addresses, snapping lines to roads. While
     * it is, an empty map is "not yet" rather than "nothing", and the core holds off its fallback location.
     */
    isResolving?: boolean;
}

/** Coordinates a module resolved for records that carry none, keyed by record id. */
export interface IMapFallbackCoordinates {
    [recordId: string]: IMapCoordinates | undefined;
}

/** Corner of the map a piece of chrome is anchored to. */
export type IMapOverlayPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/** A piece of chrome a module draws over the map. */
export interface IMapOverlayItem {
    position: IMapOverlayPosition;
    /**
     * Where it sits among the other chrome in that corner; lower comes first. The core's own pieces sit at
     * `MAP_OVERLAY_ORDER`, so a module can place itself before or after them.
     */
    order: number;
    element: ReactNode;
}

/** Where the core's own chrome sits, so a module can slot in around it. */
export const MAP_OVERLAY_ORDER = {
    /** The status message saying what the control is doing, top-left. */
    status: 50,
    /** The provider picker, top-right. */
    providerPicker: 0
};

/** What the control says it is doing, or warns about. Only the highest priority message is shown. */
export interface IMapStatusMessage {
    message: string;
    /** Whether the message is progress on something still running, rather than a finished state. */
    isBusy?: boolean;
    /** Whether the message is a warning, such as a load that stopped at its cap. */
    isWarning?: boolean;
    /** Higher wins. The core reports its own at `MAP_STATUS_PRIORITY`. */
    priority: number;
}

/** Priorities the core's own messages use, so a module can rank its own against them. */
export const MAP_STATUS_PRIORITY = {
    /** Every page of the view is still being loaded. */
    loading: 60,
    /** The load stopped at `MaxRecords`. */
    truncated: 30
};

/** What a module publishes for the rest of the control to read. A module extends it with its own fields. */
export interface IMapModuleState {
    /**
     * Attribute paths the module reads off the records, so the core can add the linked column a dot
     * notation path needs the same way it does for the coordinates.
     */
    attributePaths?: string[];
    /**
     * Works out how a record's pin looks. Consulted after the control's own `onResolvePin` and before the
     * `PinRules` parameter; returning nothing falls through.
     */
    resolvePin?: IMapPinResolver;
    /** Resolves where the map looks while there are no pins. The first module offering one wins. */
    resolveFallbackLocation?: IMapFallbackLocationResolver;
}

/** What every stage of a module is handed. */
export interface IMapModuleContext {
    context: IContext;
    dataset?: IDataset;
    theme: ITheme;
    /** The core's labels. A module carries its own strings and resolves them itself. */
    labels: IMapLabels;
    /** BCP 47 tag of the user's language, for a service that answers in one. */
    language?: string;
    /** Attributes the core reads coordinates from, and the ones a module writes them back to. */
    coordinateAttributes: {
        latitude?: string;
        longitude?: string;
    };
    /** Geocoding service of the drawing provider, or of another configured one. Absent when none has one. */
    geocoder?: IMapGeocoder;
    /** Directions service of the drawing provider, or of another configured one. Absent when none has one. */
    directions?: IMapDirections;
    /** Whether the dataset, or the core loading every page of it, is still bringing records in. */
    isLoading: boolean;
    /** Ids of the records selected in the dataset. Pin ids are the provider's space, not this one. */
    selectedRecordIds: string[];
    /** Reports an output, the same way the control does. */
    onNotifyOutputChanged: (outputs: IMapOutputs) => void;
    /** Reads what another module published from `useModuleState`. Modules run in `MAP_MODULE_ORDER`. */
    read: <TModule extends keyof IMapModules>(module: TModule) => IMapModuleStateOf<TModule> | undefined;
}

/** What the pins stage is handed, on top of the module context. */
export interface IMapPinsContext extends IMapModuleContext {
    /** The records being drawn, after the records stage. */
    records: IRecord[];
    /**
     * Whether the core is still adding the columns a dot notation attribute needs. The pins are empty
     * meanwhile, since the coordinates read as absent until the columns arrive.
     */
    isPreparingAttributes: boolean;
    /**
     * Places records the way the core does - same attributes, same pin appearance - so a module that
     * resolved coordinates of its own hands them here and gets pins back in dataset order.
     */
    placeRecords: (records: IRecord[], fallbackCoordinates?: IMapFallbackCoordinates) => IMapPins;
}

/** What every stage after the viewport is known is handed. */
export interface IMapViewContext extends IMapPinsContext {
    /** The pins, after every module's pins stage. */
    pins: IMapPins;
    /** Where the control asked the map to look. */
    viewport: IMapViewportRequest;
    /** What the map is actually showing, as the provider last reported it. */
    visibleViewport: IMapViewport;
    /** Points the map somewhere, until the pins change and take over again. */
    onFocusViewport: (viewport: IMapViewportRequest) => void;
}

/**
 * A feature the Map can run with.
 *
 * A module is a set of optional stage hooks. The core calls each stage for every module in
 * `MAP_MODULE_ORDER`, in one render pass, in this order: `useModuleState`, `useRecords`, `usePins`,
 * `useDrawnLocations`, `useProviderProps`, `useOverlay`, `useStatus`. Each is a React hook and follows the
 * rules of hooks, which is why the set of modules must not change while the control is mounted; a changed
 * set remounts the map.
 *
 * Build one with its `create<Name>Module` function rather than by hand; the functions are where the
 * options are documented.
 */
export interface IMapModule<TState extends IMapModuleState = IMapModuleState> {
    /** Runs first. What it returns is readable by every later stage of this and every other module. */
    useModuleState?: (context: IMapModuleContext) => TState;
    /** Narrows or reorders the records the map draws. */
    useRecords?: (records: IRecord[], context: IMapModuleContext) => IRecord[];
    /** Adds to the pins: places records the core could not, groups pins into routes. */
    usePins?: (pins: IMapPins, context: IMapPinsContext) => IMapPins;
    /** Decides which pins reach the provider for the current view - grouping overlapping ones, say. */
    useDrawnLocations?: (locations: IMapLocation[], context: IMapViewContext) => IMapLocation[];
    /** Adds to, or wraps, what the provider receives - a card to anchor, a drag handler. */
    useProviderProps?: (props: IMapProviderProps, context: IMapViewContext) => IMapProviderProps;
    /** Chrome to draw over the map. */
    useOverlay?: (context: IMapViewContext) => IMapOverlayItem[] | undefined;
    /** What the module is doing, or warning about, shown as the status message. */
    useStatus?: (context: IMapViewContext) => IMapStatusMessage | undefined;
}

/**
 * The modules a map runs with, one optional key per feature. A key is filled by calling that module's
 * `create<Name>Module` function; omit it and neither the feature nor its UI exists. Each key carries the
 * state its own module publishes, which is what `read` hands back for it.
 *
 * A module takes its settings as options, never from the manifest; see `descriptors/` for that mapping.
 */
export interface IMapModules {
    /** A panel of the values the records hold, to narrow the pins by. */
    filter?: IMapModule;
    /** Places records that carry an address but no coordinates, by geo-coding the address. */
    geocoding?: IMapModule;
    /** Connects pins that share a value into a line, optionally following the roads. */
    routes?: IMapModule;
    /** Draws pins that overlap in the current view as one pin carrying the count. */
    clustering?: IMapModule;
    /** Moves a record by dragging its pin, and creates one by clicking the map. */
    editing?: IMapModule;
    /** What a pin opens when it is activated. */
    cards?: IMapModule;
    /** A search box: the entity's quick find, and places from the geo-coding service. */
    search?: IMapModule;
    /** A legend drawn over the map. */
    legend?: IMapModule;
    /** Centres the map on the user while there is nothing else to look at. */
    userLocation?: IMapModule;
    /** Runs a Client API web resource, for pin rules configuration cannot express. */
    clientApi?: IMapModule;
}

/** The state a module publishes, taken off its slot in `IMapModules`. What `read` hands back for that key. */
export type IMapModuleStateOf<TModule extends keyof IMapModules> =
    NonNullable<IMapModules[TModule]> extends IMapModule<infer TState> ? TState : never;

/**
 * The order the core runs the modules in, which is also the order their chrome stacks in a corner and the
 * order `read` sees their state settle. Fixed here so a consumer never has to order anything.
 */
export const MAP_MODULE_ORDER = [
    'clientApi',
    'userLocation',
    'filter',
    'geocoding',
    'routes',
    'clustering',
    'editing',
    'cards',
    'search',
    'legend'
] as const satisfies readonly (keyof IMapModules)[];

//a module left out above would silently never run, so the compiler checks that none is
const _everyModuleOrdered: keyof IMapModules extends (typeof MAP_MODULE_ORDER)[number] ? true : never = true;
