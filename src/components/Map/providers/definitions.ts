import { useEffect } from 'react';
import { IMapProviderDefinition, IMapProviderOption } from './provider';
import { useMapProviderCache } from './providerCache';
import { createLeafletMapProvider, createNominatimGeocoder, createOsrmDirections } from './leaflet';
import { createHereMapsProvider, createHereMapsGeocoder, createHereMapsDirectionsService } from './here-maps';
import { createMapyProvider, createMapyGeocoder, createMapyDirectionsService } from './mapy';

/** Provider the map opens with while `DefaultProvider` is empty. Keyless, so it is always configured. */
export const DEFAULT_MAP_PROVIDER_ID = 'osm';

//one instance shared by every control - a fresh component identity is what remounts a map
export const DEFAULT_MAP_PROVIDER = createLeafletMapProvider();

/**
 * Providers every control resolves out of the box. Google Maps is deliberately absent: importing it here
 * would put the optional `@vis.gl/react-google-maps` peer dependency in every consumer's build graph. It
 * ships as `googleMapsProvider` from `.../Map/providers/google-maps`, passed through the `providers` prop.
 */
const BUILT_IN_MAP_PROVIDERS: IMapProviderDefinition[] = [
    {
        id: DEFAULT_MAP_PROVIDER_ID,
        label: 'OpenStreetMap',
        createProvider: () => DEFAULT_MAP_PROVIDER,
        createGeocoder: () => createNominatimGeocoder(),
        createDirections: () => createOsrmDirections()
    },
    {
        id: 'here',
        label: 'HERE',
        apiKeyParameterName: 'HereApiKey',
        createProvider: ({ apiKey = '' }) => createHereMapsProvider({ apiKey }),
        createGeocoder: createHereMapsGeocoder,
        createDirections: createHereMapsDirectionsService
    },
    {
        id: 'mapy',
        label: 'Mapy.com',
        apiKeyParameterName: 'MapyApiKey',
        createProvider: ({ apiKey = '' }) => createMapyProvider({ apiKey }),
        createGeocoder: createMapyGeocoder,
        createDirections: createMapyDirectionsService
    }
];

/** Merges the host's providers into the built-in ones. An entry reusing a built-in id replaces it in place. */
export const getMapProviderDefinitions = (hostProviders?: IMapProviderDefinition[]): IMapProviderDefinition[] => {
    if (!hostProviders?.length) {
        return BUILT_IN_MAP_PROVIDERS;
    }
    //a Map keeps the position of a key it already holds, which is what makes an override a replacement
    const merged = new Map(BUILT_IN_MAP_PROVIDERS.map((definition) => [definition.id, definition]));
    hostProviders.forEach((definition) => merged.set(definition.id, definition));
    return [...merged.values()];
};

export interface IUseMapProviderOptions {
    definitions: IMapProviderDefinition[];
    /** An empty value counts as no key at all, which is what an unset manifest property looks like. */
    getApiKey: (parameterName: string) => string | undefined;
    /** Whether every configured provider is offered, or the default alone. */
    enableSwitching: boolean;
    defaultProviderId: string;
}

/**
 * Resolves the provider definitions and api keys into the list the control offers. Definitions are plain
 * data, so the caller may rebuild them every render; the provider built from one is cached per id and key.
 */
export const useMapProviderOptions = (options: IUseMapProviderOptions): IMapProviderOption[] => {
    const { definitions, getApiKey, enableSwitching, defaultProviderId } = options;
    const resolveOptions = useMapProviderCache();

    const configured = resolveOptions(definitions
        //a keyless provider is configured by definition, so it reads as an empty key rather than a missing one
        .map((definition) => ({
            definition,
            apiKey: definition.apiKeyParameterName ? getApiKey(definition.apiKeyParameterName) || undefined : ''
        }))
        .filter((entry): entry is { definition: IMapProviderDefinition; apiKey: string } => entry.apiKey !== undefined)
        .map(({ definition, apiKey }) => ({
            id: definition.id,
            label: definition.label,
            //a definition's own cacheKey stands in for configuration the control cannot see
            cacheKey: `${definition.cacheKey ?? definition.id}|${apiKey}`,
            createProvider: () => definition.createProvider({ apiKey }),
            createGeocoder: definition.createGeocoder && (() => definition.createGeocoder!({ apiKey })),
            createDirections: definition.createDirections && (() => definition.createDirections!({ apiKey }))
        })));

    const picked = configured.find((option) => option.id === defaultProviderId);
    //a misconfigured default is invisible on the map itself, it just opens on something else
    const warning = !picked && configured.length
        ? `Map: DefaultProvider is "${defaultProviderId}", but no provider with that id is configured - using "${configured[0].id}" instead.`
        : undefined;
    useEffect(() => {
        if (warning) {
            console.warn(warning);
        }
    }, [warning]);

    //the picker only renders from two options up, so the single-provider arrays need no stable identity
    return enableSwitching ? configured : picked ? [picked] : configured.slice(0, 1);
};
