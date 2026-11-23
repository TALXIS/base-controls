import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../../grid/GridLivePreview'
import { STORE_OPENINGS_TABS, withFinishedApp } from '../storeOpeningsFiles'

const STORES_THROUGH_API_FILE: IGridExampleFile = {
    name: 'stores.ts',
    code: `import { DataTypes, IColumn, IRecord, IRecordSaveOperationResult, MemoryDataProvider } from '@talxis/client-libraries'
import { saveStore } from './api'

export const OPEN = 3

//each status is drawn as a tag in its colour
export const STATUSES = [
    { Value: 1, Label: 'Planned', Color: '#8764b8' },
    { Value: 2, Label: 'Fitting out', Color: '#ca5010' },
    { Value: OPEN, Label: 'Open', Color: '#107c10' },
]

//every column of a store, with its width in the grid
const COLUMNS: IColumn[] = [
    //the primary column, drawn as a link in the grid
    { name: 'name', displayName: 'Store', dataType: DataTypes.SingleLineText, isPrimary: true, visualSizeFactor: 160 },
    { name: 'country', displayName: 'Country', dataType: DataTypes.SingleLineText, visualSizeFactor: 100 },
    { name: 'manager', displayName: 'Manager', dataType: DataTypes.SingleLineText, visualSizeFactor: 140 },
    { name: 'status', displayName: 'Status', dataType: DataTypes.OptionSet, metadata: { OptionSet: STATUSES }, visualSizeFactor: 110 },
    { name: 'openingdate', displayName: 'Opening date', dataType: DataTypes.DateAndTimeDateOnly, visualSizeFactor: 120 },
    //summed in the row pinned under the grid
    { name: 'floorarea', displayName: 'Floor area (m²)', dataType: DataTypes.WholeNone, visualSizeFactor: 120, aggregation: { aggregationFunction: 'sum' } },
    { name: 'seats', displayName: 'Seats', dataType: DataTypes.WholeNone, visualSizeFactor: 80 },
]

//the columns the list opens with
export const VIEW_COLUMNS = [
    ...COLUMNS.filter(column => column.name !== 'seats'),
    { name: 'lat', displayName: 'Latitude', dataType: DataTypes.Decimal, isHidden: true },
    { name: 'lng', displayName: 'Longitude', dataType: DataTypes.Decimal, isHidden: true },
]

//the new stores of a coffee chain, with latitude and longitude in decimal degrees
export const STORES = [
    { storeid: 'lyon', name: 'Lyon Part-Dieu', country: 'France', manager: 'Camille Durand', status: 3, openingdate: '2026-04-18', floorarea: 180, seats: 46, lat: 45.7606, lng: 4.8597 },
    { storeid: 'porto', name: 'Porto Ribeira', country: 'Portugal', manager: 'Inês Costa', status: 3, openingdate: '2026-09-05', floorarea: 140, seats: 38, lat: 41.1406, lng: -8.6132 },
    { storeid: 'krakow', name: 'Kraków Kazimierz', country: 'Poland', manager: 'Marta Nowak', status: 2, openingdate: '2026-12-12', floorarea: 210, seats: 54, lat: 50.0517, lng: 19.945 },
    { storeid: 'ghent', name: 'Ghent Korenmarkt', country: 'Belgium', manager: 'Pieter Claes', status: 2, openingdate: '2027-02-06', floorarea: 120, seats: 30, lat: 51.0545, lng: 3.7216 },
    { storeid: 'bologna', name: 'Bologna Santo Stefano', country: 'Italy', manager: 'Giulia Romano', status: 1, openingdate: '2027-04-17', floorarea: 160, seats: 42, lat: 44.4914, lng: 11.348 },
    { storeid: 'gothenburg', name: 'Gothenburg Haga', country: 'Sweden', manager: 'Erik Lindqvist', status: 1, openingdate: '2027-06-05', floorarea: 195, seats: 50, lat: 57.6985, lng: 11.9555 },
]

//new: a memory provider that saves each store through your API first
class StoresProvider extends MemoryDataProvider {
    public async onRecordSave(record: IRecord): Promise<IRecordSaveOperationResult> {
        try {
            await saveStore(record.toRawData())
        } catch (error) {
            //new: a failed save, with the message the grid shows on the row
            return { recordId: record.getRecordId(), success: false, fields: [], errors: [{ message: (error as Error).message }] }
        }
        return super.onRecordSave(record)
    }
}

//each load's provider writes saved changes back into these rows
export const createStoresProvider = () => {
    //new: your provider in place of the memory provider
    const provider = new StoresProvider({
        dataSource: STORES,
        //drawn until a view sets its own
        columns: VIEW_COLUMNS,
        metadata: { PrimaryIdAttribute: 'storeid', PrimaryNameAttribute: 'name', LogicalName: 'store', DisplayCollectionName: 'stores', QuickFindColumns: ['name', 'manager', 'country'] },
    })
    //offers every store column to Edit columns
    provider.hooks.availableColumns.add(columns => columns.push(...COLUMNS))
    return provider
}
`,
}

const API_FILE: IGridExampleFile = {
    name: 'api.ts',
    code: `import type { IRawRecord } from '@talxis/client-libraries'

const MIN_FLOOR_AREA = 50

//stands in for your server
export const saveStore = async (store: IRawRecord) => {
    await new Promise(resolve => setTimeout(resolve, 600))
    if (store.floorarea < MIN_FLOOR_AREA) {
        throw new Error(\`The floor area must be at least \${MIN_FLOOR_AREA} m².\`)
    }
}
`,
}

const DATAVERSE_FILE: IGridExampleFile = {
    name: 'dataverse.ts',
    code: `import { FetchXmlDataProvider } from '@talxis/client-libraries'

//not run on this page: in a model-driven app, import createStoresProvider from here

//picks the table's rows
const fetchXml = \`<fetch>
    <entity name="new_store">
        <filter>
            <condition attribute="statecode" operator="eq" value="0" />
        </filter>
    </entity>
</fetch>\`

export const createStoresProvider = () => new FetchXmlDataProvider({ fetchXml })
`,
}

export const WhereStoresComeFromExample = () => <GridExampleRunner seedCode={withFinishedApp(STORES_THROUGH_API_FILE, API_FILE, DATAVERSE_FILE)} tabs={STORE_OPENINGS_TABS} />
