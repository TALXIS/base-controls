import { useMemo } from 'react'
import { Dataset, DataTypes, IColumn, IRawRecord, MemoryDataProvider } from '@talxis/client-libraries'

const sampleLocations: IRawRecord[] = [
    { name: 'Prague HQ', lat: 50.0755, lng: 14.4378 },
    { name: 'Brno office', lat: 49.1951, lng: 16.6068 },
    { name: 'Ostrava office', lat: 49.8209, lng: 18.2625 },
]

const columns: IColumn[] = [
    { name: 'name', alias: 'name', displayName: 'Name', dataType: DataTypes.SingleLineText, order: 0, visualSizeFactor: 160, isPrimary: true },
    { name: 'lat', alias: 'lat', displayName: 'Latitude', dataType: DataTypes.Decimal, order: 1, visualSizeFactor: 100 },
    { name: 'lng', alias: 'lng', displayName: 'Longitude', dataType: DataTypes.Decimal, order: 2, visualSizeFactor: 100 },
]

export const mapPinMetadata = { LatitudeAttributeName: 'lat', LongitudeAttributeName: 'lng' }

export const useSampleMapDataset = () => {
    return useMemo(() => {
        const provider = new MemoryDataProvider({
            dataSource: sampleLocations,
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
    }, [])
}
