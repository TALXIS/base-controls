import { IMap } from "../interfaces";
import { useCallback, useEffect, useState } from "react";
import { IMapLocation } from "../providers";
import { useEventEmitter } from "../../../hooks/useEventEmitter";
import { IDataProviderEventListeners } from "@talxis/client-libraries";
import './Map.css';

export const Map = (props: IMap) => {
    const { Dataset: dataset, PinMetadata: pinMetadata, MapProvider } = props.parameters;
    const [locations, setLocations] = useState<IMapLocation[]>([]);

    const loadLocations = useCallback(() => {
        if (!dataset || !pinMetadata) {
            setLocations([]);
            return;
        }

        const records = dataset.getRecords();
        const result: IMapLocation[] = [];

        for (const record of records) {
            try {
                const latValue = record.getValue(pinMetadata.LatitudeAttributeName);
                const lngValue = record.getValue(pinMetadata.LongitudeAttributeName);

                const lat = typeof latValue === 'number' ? latValue : parseFloat(latValue);
                const lng = typeof lngValue === 'number' ? lngValue : parseFloat(lngValue);

                if (!isNaN(lat) && !isNaN(lng)) {
                    result.push({ id: record.getRecordId(), latitude: lat, longitude: lng });
                }
            } catch (error) {
                console.warn(`Failed to extract location from record ${record.getRecordId()}:`, error);
            }
        }

        setLocations(result);
    }, [dataset, pinMetadata]);

    useEffect(() => {
        dataset?.refresh();
    }, []);

    useEventEmitter<IDataProviderEventListeners>(dataset, 'onNewDataLoaded', loadLocations);

    return (
        <div className='map-picker'>
            <MapProvider locations={locations} />
        </div>
    );
};
