import { useCallback, useRef, useState } from "react";
import { IStringProperty } from "@interfaces";
import { IMapParameters } from "../interfaces";
import { getMapDirections, getMapGeocoder } from "../providers/geoServices";
import { DEFAULT_MAP_PROVIDER, DEFAULT_MAP_PROVIDER_ID, getMapProviderDefinitions, useMapProviderOptions } from "../providers/definitions";
import { IMapProviderDefinition } from "../providers/provider";

export interface IUseMapProviders {
    parameters: IMapParameters;
    /** Definitions the host passed on top of the built-in ones. */
    providers?: IMapProviderDefinition[];
    /** Told which provider the end user picked. */
    onPick: (id: string) => void;
}

/**
 * Resolves which provider draws the map from the definitions and the api keys in the manifest, and holds
 * on to the end user's pick until the host changes the parameter under it.
 */
export const useMapProviders = (props: IUseMapProviders) => {
    const { parameters, onPick } = props;
    const { MapProvider, EnableProviderSwitching, DefaultProvider } = parameters;
    //the picker is on and the map opens on the keyless default unless the maker says otherwise
    const enableSwitching = EnableProviderSwitching?.raw !== false;
    const defaultProviderId = DefaultProvider?.raw || DEFAULT_MAP_PROVIDER_ID;
    //keys are read by the name their definition declares, not by one the control knows
    const getApiKey = (parameterName: string) => (parameters[parameterName] as IStringProperty | undefined)?.raw || undefined;

    const options = useMapProviderOptions({
        definitions: getMapProviderDefinitions(props.providers),
        getApiKey,
        enableSwitching,
        defaultProviderId
    });

    //an empty MapProvider is a field nobody has picked in yet, so it falls through to the maker's default
    const requestedProviderId = MapProvider?.raw || DefaultProvider?.raw || undefined;
    const [pickedProviderId, setPickedProviderId] = useState(requestedProviderId);
    const onPickRef = useRef(onPick);
    onPickRef.current = onPick;

    const requestedProviderIdRef = useRef(requestedProviderId);
    //a host changing the parameter takes the choice back from the end user, so their pick goes with it
    if (requestedProviderIdRef.current !== requestedProviderId) {
        requestedProviderIdRef.current = requestedProviderId;
        setPickedProviderId(requestedProviderId);
    }

    //the picked provider can disappear when the host rebuilds the list, so the first option is the safety net
    const selectedOption = options.find((option) => option.id === pickedProviderId) ?? options[0];

    const onPickProvider = useCallback((id: string) => {
        setPickedProviderId(id);
        onPickRef.current(id);
    }, []);

    return {
        options,
        selectedId: selectedOption?.id,
        //only reachable when a host overrode the keyless Leaflet definition away and configured nothing instead
        provider: selectedOption?.provider ?? DEFAULT_MAP_PROVIDER,
        geocoder: getMapGeocoder(options, selectedOption?.id),
        directions: getMapDirections(options, selectedOption?.id),
        onPickProvider
    };
};
