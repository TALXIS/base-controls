import { useMemo } from 'react'
import { Dataset, DataTypes, IColumn, IRawRecord, MemoryDataProvider } from '@talxis/client-libraries'

const sampleLocations: IRawRecord[] = [
    { name: 'Prague', lat: 50.1038678, lng: 14.4806513 },
    { name: 'Brno', lat: 49.2127963, lng: 16.5661209 },
    { name: 'Warsaw', lat: 50.0571376, lng: 22.4924221 },
    { name: 'Sarajevo', lat: 43.8563589, lng: 18.4067263 },
]

const columns: IColumn[] = [
    { name: 'name', alias: 'name', displayName: 'Name', dataType: DataTypes.SingleLineText, order: 0, visualSizeFactor: 160, isPrimary: true },
    { name: 'lat', alias: 'lat', displayName: 'Latitude', dataType: DataTypes.Decimal, order: 1, visualSizeFactor: 100 },
    { name: 'lng', alias: 'lng', displayName: 'Longitude', dataType: DataTypes.Decimal, order: 2, visualSizeFactor: 100 },
]

export const mapPinMetadata = { LatitudeAttributeName: 'lat', LongitudeAttributeName: 'lng' }

export const useSampleMapDataset = (showPins: boolean) => {
    return useMemo(() => {
        const provider = new MemoryDataProvider({
            dataSource: showPins ? sampleLocations : [],
            metadata: {
                PrimaryIdAttribute: 'name',
                PrimaryNameAttribute: 'name',
                LogicalName: 'location',
                EntitySetName: 'locations',
                DisplayName: 'Location',
                DisplayCollectionName: 'Locations',
            },
        })
        const ds = new Dataset(provider)
        ds.setColumns(columns)
        void ds.refresh()
        return ds
    }, [showPins])
}
