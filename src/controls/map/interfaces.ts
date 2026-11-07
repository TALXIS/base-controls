import type { IRuntimeModule, IServiceLocator } from "@core";
import type { IMap } from "./runtime/MapRuntime";
import type { IMapComponents } from "./components";

export interface IMapPoint {
    latitude: number;
    longitude: number;
}

export interface IMapBounds {
    north: number;
    south: number;
    east: number;
    west: number;
}

/** The columns a pin's position comes from. */
export interface IMapFieldMapping {
    latitude: string;
    longitude: string;
}

/** What draws the map: Google Maps, Leaflet or a library of your own, loaded as the `library` module, which adds its map to the map's surfaces. */
export interface IMapLibrary {
    /** The library's own map, once its adapter has drawn it. */
    getInstance(): unknown;
}

/** The instances the map's modules return, by name; extend it for a module of your own. */
export interface IMapModuleMap {
    library: IMapLibrary;
}

/** A feature the map loads on every mount; the map needs one named `library`. */
export interface IMapModule<TName extends keyof IMapModuleMap = keyof IMapModuleMap> extends IRuntimeModule<IMapModuleMap, TName, IMap> { }

export type IMapModuleLocator = IServiceLocator<IMapModuleMap>;

export interface IMapProps {
    fieldMapping: IMapFieldMapping;
    /** The map's modules, read on every mount; one of them must be a `library`. */
    modules: IMapModule[];
    /** Called with the runtime of each mount, before its init; subscribe here. */
    onSetup?: (map: IMap) => void;
    /** Called once as the map loads, after its modules. */
    onLoad?: (map: IMap) => void | Promise<void>;
    /** A length such as `'480px'`; left out, the map fills its parent. */
    height?: string;
    className?: string;
    /** Replacements for the map's slots. */
    components?: IMapComponents;
}
