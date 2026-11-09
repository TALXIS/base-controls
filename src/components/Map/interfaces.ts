import { IParameters, IStringProperty, ITwoOptionsProperty, IWholeNumberProperty } from "@interfaces";
import { IControl, IOutputs } from "@interfaces/context";
import { IDataset } from "@talxis/client-libraries";
import { IMapTranslations } from "./labels";
import { IMapProviderDefinition, IMapProviderProps } from "./providers/provider";
import { IMapPinResolver } from "./core/pinAppearance";
import { IMapViewport, IMapViewportOptions } from "./core/viewport";
import { IMapModules } from "./modules/interfaces";
import { IMapComponents } from "./components/components";

export interface IMap extends IControl<IMapParameters, IMapOutputs, IMapTranslations, IMapProviderProps> {
    /**
     * Features to turn on. Each is built with its `create<Name>Module` function; without any, the map only
     * draws pins. The set of keys must not change while the control is mounted; a changed set remounts the map.
     */
    modules?: IMapModules;
    /**
     * Extra map providers. OpenStreetMap, HERE and Mapy.com are built in; Google Maps is added by passing
     * `googleMapsProvider`. An entry with a built-in id replaces it.
     */
    providers?: IMapProviderDefinition[];
    /** Decides a pin's appearance in code. Wins over the modules and `PinRules`; return nothing to fall through. */
    onResolvePin?: IMapPinResolver;
    /** Overrides for how the map decides where to look. */
    viewportOptions?: IMapViewportOptions;
    /** Replaces the status message or the provider picker. A module's UI is replaced through its own `components` option. */
    components?: Partial<IMapComponents>;
}

/** The manifest parameters the core reads. Modules take their settings as options instead. */
export interface IMapParameters extends IParameters {
    /** Records to draw as pins. The host loads them. */
    Dataset: IDataset;
    /** Attribute holding the latitude. Dot notation reaches across a lookup: `cds_addressid.cds_latitude`. */
    LatitudeAttributeName: IStringProperty;
    /** Attribute holding the longitude. */
    LongitudeAttributeName: IStringProperty;
    /** Whether to add the hidden columns a dot notation attribute needs. On by default. */
    AutoAddLinkedColumns?: Omit<ITwoOptionsProperty, 'attributes'>;
    /**
     * Which records to draw: `page` is the page the host loaded, `all` every page of the view. Defaults to
     * `page`; `all` works on a copy of the dataset.
     */
    PinLoading?: Omit<ComponentFramework.PropertyTypes.EnumProperty<'page' | 'all'>, 'type'>;
    /** Cap for `PinLoading: all`. Defaults to 50000. */
    MaxRecords?: IWholeNumberProperty;
    /**
     * Pin rules as a JSON array: an appearance (`color`, `url`, `webResourceName`) plus the
     * `attributeName` and `value` to match. First match wins; a rule without `attributeName` is the fallback.
     */
    PinRules?: IStringProperty;
    /** Whether the provider draws its own points of interest. Hidden by default; not every provider supports it. */
    ShowPointsOfInterest?: Omit<ITwoOptionsProperty, 'attributes'>;
    /** The provider the user picked, fed back from the output of the same name. Wins over `DefaultProvider`. */
    MapProvider?: IStringProperty;
    /** Provider the map opens with. Defaults to `osm`. */
    DefaultProvider?: IStringProperty;
    /** Whether the user can switch between the configured providers. On by default. */
    EnableProviderSwitching?: Omit<ITwoOptionsProperty, 'attributes'>;
    HereApiKey?: IStringProperty;
    MapyApiKey?: IStringProperty;
    GoogleApiKey?: IStringProperty;
    /** Api key of a provider from `providers`, under the name its `apiKeyParameterName` declares. */
    [apiKeyParameterName: `${string}ApiKey`]: IStringProperty | undefined;
}

export interface IMapOutputs extends IOutputs {
    /** What the map is showing, reported on pan and zoom. */
    Viewport?: IMapViewport;
    /** The provider the user picked. Feed it back as the `MapProvider` parameter to make it stick. */
    MapProvider?: string;
}
