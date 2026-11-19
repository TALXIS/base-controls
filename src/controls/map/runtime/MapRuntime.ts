import { IDataProvider, IRecord } from "@talxis/client-libraries";
import { IRuntime, IRuntimePartMap, IServiceRegistry, Runtime, ServiceRegistry } from "@core";
import type { IMapModule, IMapModuleLocator, IMapModuleMap, IMapPoint, IMapProps } from "../interfaces";
import { MapViewport } from "./viewport/MapViewport";

export interface IMapServiceMap {
    provider: IDataProvider;
    viewport: MapViewport;
}

export type IMapServiceRegistry = IServiceRegistry<IMapServiceMap>;

/** Where the provider's records sit and where the view goes, whatever draws them. */
export interface IMap extends IRuntime {
    readonly services: IMapServiceRegistry;
    /** The loaded modules, by name; `library` is always among them. */
    readonly modules: IMapModuleLocator;
    /** Where the record's pin goes; `undefined` when its position is not a number. */
    getPoint(record: IRecord): IMapPoint | undefined;
}

export interface IMapRuntimeParameters {
    provider: IDataProvider;
    getProps: () => IMapProps;
}

export class MapRuntime extends Runtime<IRuntimePartMap, IMapModuleMap, IMap> implements IMap {
    public readonly services = new ServiceRegistry<IMapServiceMap>();
    private _getProps: () => IMapProps;

    constructor(parameters: IMapRuntimeParameters) {
        super();
        this._getProps = parameters.getProps;
        this.services.provide('provider', parameters.provider);
        const viewport = new MapViewport({ map: this });
        this.services.provide('viewport', viewport, { onDestroy: () => viewport.destroy() });
    }

    public getPoint(record: IRecord): IMapPoint | undefined {
        const { latitude, longitude } = this._getProps().fieldMapping;
        try {
            const lat = this._toNumber(record.getValue(latitude));
            const lng = this._toNumber(record.getValue(longitude));
            return isNaN(lat) || isNaN(lng) ? undefined : { latitude: lat, longitude: lng };
        }
        catch (error) {
            console.warn(`Failed to read the position of record ${record.getRecordId()}:`, error);
            return undefined;
        }
    }

    protected getModules(): IMapModule[] {
        return this._getProps().modules;
    }

    protected async onInit(): Promise<void> {
        if (!this.modules.find('library')) {
            throw new Error('Map needs a library module: use GoogleMap or LeafletMap, or give a library module of your own and draw its map as a child.');
        }
        await this._getProps().onLoad?.(this);
    }

    protected onDestroy(): void {
        this.services.destroy();
    }

    private _toNumber(value: unknown): number {
        return typeof value === 'number' ? value : parseFloat(String(value));
    }
}
