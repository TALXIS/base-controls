import { IMapPicker } from "../interfaces";
import { useEffect, useState } from "react";
import { IMapLocation } from "../providers";
import './MapPicker.css';

export const MapPicker = (props: IMapPicker) => {
    const { Dataset: dataset, PinMetadata: pinMetadata, MapProvider } = props.parameters;
    const [locations, setLocations] = useState<IMapLocation[]>([]);

    useEffect(() => {
        const loadLocations = async () => {
            if (!dataset || !pinMetadata) {
                setLocations([]);
                return;
            }

            const records = await dataset.refresh();
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
        };

        loadLocations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className='map-picker'>
            <MapProvider locations={locations} />
        </div>
    );
};
