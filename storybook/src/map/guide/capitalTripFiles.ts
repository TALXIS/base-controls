import type { IRunnerTab } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'

/** The preview and code tabs of a map example; the docs dataset is not used. */
export const CAPITAL_TABS: IRunnerTab[] = ['preview', 'code']

/** A column a capital can carry besides its name and position. */
export type CapitalField = 'country' | 'population' | 'euSince' | 'region' | 'status'

export interface ICitiesFileParameters {
    /** The names of the capitals `data.ts` leaves out. */
    leaveOut?: string[]
}

interface ICapital {
    name: string
    country: string
    lat: number
    lng: number
    population: number
    euSince: number
    region: number
    isVisited: boolean
}

//the capitals of the EU; each example's data.ts holds only the fields it reads
const CAPITALS: ICapital[] = [
    { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041, population: 918000, euSince: 1958, region: 2, isVisited: true },
    { name: 'Athens', country: 'Greece', lat: 37.9838, lng: 23.7275, population: 643000, euSince: 1981, region: 3, isVisited: false },
    { name: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.405, population: 3755000, euSince: 1958, region: 2, isVisited: true },
    { name: 'Bratislava', country: 'Slovakia', lat: 48.1486, lng: 17.1077, population: 475000, euSince: 2004, region: 4, isVisited: true },
    { name: 'Brussels', country: 'Belgium', lat: 50.8503, lng: 4.3517, population: 1222000, euSince: 1958, region: 2, isVisited: false },
    { name: 'Bucharest', country: 'Romania', lat: 44.4268, lng: 26.1025, population: 1716000, euSince: 2007, region: 4, isVisited: false },
    { name: 'Budapest', country: 'Hungary', lat: 47.4979, lng: 19.0402, population: 1706000, euSince: 2004, region: 4, isVisited: true },
    { name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lng: 12.5683, population: 660000, euSince: 1973, region: 1, isVisited: false },
    { name: 'Dublin', country: 'Ireland', lat: 53.3498, lng: -6.2603, population: 592000, euSince: 1973, region: 1, isVisited: false },
    { name: 'Helsinki', country: 'Finland', lat: 60.1699, lng: 24.9384, population: 674000, euSince: 1995, region: 1, isVisited: false },
    { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393, population: 545000, euSince: 1986, region: 3, isVisited: false },
    { name: 'Ljubljana', country: 'Slovenia', lat: 46.0569, lng: 14.5058, population: 295000, euSince: 2004, region: 3, isVisited: false },
    { name: 'Luxembourg', country: 'Luxembourg', lat: 49.6116, lng: 6.1319, population: 134000, euSince: 1958, region: 2, isVisited: false },
    { name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, population: 3332000, euSince: 1986, region: 3, isVisited: false },
    { name: 'Nicosia', country: 'Cyprus', lat: 35.1856, lng: 33.3823, population: 330000, euSince: 2004, region: 3, isVisited: false },
    { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, population: 2103000, euSince: 1958, region: 2, isVisited: true },
    { name: 'Prague', country: 'Czechia', lat: 50.0755, lng: 14.4378, population: 1357000, euSince: 2004, region: 4, isVisited: true },
    { name: 'Riga', country: 'Latvia', lat: 56.9496, lng: 24.1052, population: 605000, euSince: 2004, region: 1, isVisited: false },
    { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, population: 2748000, euSince: 1958, region: 3, isVisited: true },
    { name: 'Sofia', country: 'Bulgaria', lat: 42.6977, lng: 23.3219, population: 1236000, euSince: 2007, region: 4, isVisited: false },
    { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686, population: 984000, euSince: 1995, region: 1, isVisited: false },
    { name: 'Tallinn', country: 'Estonia', lat: 59.437, lng: 24.7536, population: 454000, euSince: 2004, region: 1, isVisited: false },
    { name: 'Valletta', country: 'Malta', lat: 35.8989, lng: 14.5146, population: 6000, euSince: 2004, region: 3, isVisited: false },
    { name: 'Vienna', country: 'Austria', lat: 48.2082, lng: 16.3738, population: 2005000, euSince: 1995, region: 2, isVisited: true },
    { name: 'Vilnius', country: 'Lithuania', lat: 54.6872, lng: 25.2797, population: 588000, euSince: 2004, region: 1, isVisited: false },
    { name: 'Warsaw', country: 'Poland', lat: 52.2297, lng: 21.0122, population: 1863000, euSince: 2004, region: 4, isVisited: false },
    { name: 'Zagreb', country: 'Croatia', lat: 45.815, lng: 15.9819, population: 767000, euSince: 2013, region: 3, isVisited: false },
]

const COLUMN_CODE: { [field in CapitalField]: string } = {
    country: `{ name: 'country', displayName: 'Country', dataType: DataTypes.SingleLineText }`,
    population: `{ name: 'population', displayName: 'Population', dataType: DataTypes.WholeNone }`,
    euSince: `{ name: 'euSince', displayName: 'EU member since', dataType: DataTypes.WholeNone }`,
    region: `{ name: 'region', displayName: 'Region', dataType: DataTypes.OptionSet, metadata: { OptionSet: REGIONS } }`,
    status: `{ name: 'status', displayName: 'Trip', dataType: DataTypes.OptionSet, metadata: { OptionSet: STATUSES } }`,
}

const formatValue = (capital: ICapital, field: string) => {
    if (field === 'status') {
        return capital.isVisited ? 'VISITED' : 'WISHLIST'
    }
    const value = capital[field as keyof ICapital]
    return typeof value === 'string' ? `'${value}'` : String(value)
}

const formatCapitals = (fields: CapitalField[], leaveOut: string[] = []) => {
    const keys = ['name', ...fields.filter(field => field === 'country'), 'lat', 'lng', ...fields.filter(field => field !== 'country')]
    return CAPITALS
        .filter(capital => !leaveOut.includes(capital.name))
        .map(capital => `    { ${keys.map(key => `${key}: ${formatValue(capital, key)}`).join(', ')} },`)
        .join('\n')
}

const formatColumns = (fields: CapitalField[]) => [
    `{ name: 'name', displayName: 'Capital', dataType: DataTypes.SingleLineText, isPrimary: true }`,
    ...fields.filter(field => field === 'country').map(field => COLUMN_CODE[field]),
    `{ name: 'lat', displayName: 'Latitude', dataType: DataTypes.Decimal }`,
    `{ name: 'lng', displayName: 'Longitude', dataType: DataTypes.Decimal }`,
    ...fields.filter(field => field !== 'country').map(field => COLUMN_CODE[field]),
]

const REGIONS_CODE = `//an option set, with a colour for each option
export const REGIONS = [
    { Value: 1, Label: 'Northern Europe', Color: '#4f6bed' },
    { Value: 2, Label: 'Western Europe', Color: '#038387' },
    { Value: 3, Label: 'Southern Europe', Color: '#ca5010' },
    { Value: 4, Label: 'Eastern Europe', Color: '#8764b8' },
]

`

const statusesCode = (hasRegions: boolean) => `export const WISHLIST = 1
export const VISITED = 2

${hasRegions ? '//the trip status, another option set' : '//an option set, with a colour for each option'}
export const STATUSES = [
    { Value: WISHLIST, Label: 'Wishlist', Color: '#0078d4' },
    { Value: VISITED, Label: 'Visited', Color: '#107c10' },
]

`

const FIELD_MAPPING_CODE = `//the columns a pin's position is read from
export const FIELD_MAPPING = { latitude: 'lat', longitude: 'lng' }

`

/** `data.ts` with a provider of the capitals, loaded once, holding only the fields asked for. */
export const citiesFile = (fields: Exclude<CapitalField, 'status'>[] = [], parameters: ICitiesFileParameters = {}): IGridExampleFile => ({
    name: 'data.ts',
    code: `import { DataTypes, MemoryDataProvider } from '@talxis/client-libraries'

${FIELD_MAPPING_CODE}${fields.includes('region') ? REGIONS_CODE : ''}//EU capitals, with latitude and longitude in decimal degrees
const CAPITALS = [
${formatCapitals(fields, parameters.leaveOut)}
]

export const cities = new MemoryDataProvider({
    dataSource: CAPITALS,
    metadata: { PrimaryIdAttribute: 'name', PrimaryNameAttribute: 'name', LogicalName: 'capital' },
    columns: [
${formatColumns(fields).map(column => `        ${column},`).join('\n')}
    ],
})
cities.refresh()
`,
})

/** `data.ts` for a DatasetControl: the columns, the trip statuses and a new provider per load. */
export const tripFile = (...fields: CapitalField[]): IGridExampleFile => ({
    name: 'data.ts',
    code: `import { DataTypes, MemoryDataProvider } from '@talxis/client-libraries'

${FIELD_MAPPING_CODE}${fields.includes('region') ? REGIONS_CODE : ''}${statusesCode(fields.includes('region'))}export const COLUMNS = [
${formatColumns(fields).map(column => `    ${column},`).join('\n')}
]

//EU capitals, with latitude and longitude in decimal degrees
const CAPITALS = [
${formatCapitals(fields)}
]

//every provider shares the rows, so a saved change outlives a remount
export const createCitiesProvider = () => new MemoryDataProvider({
    dataSource: CAPITALS,
    metadata: { PrimaryIdAttribute: 'name', PrimaryNameAttribute: 'name', LogicalName: 'capital', QuickFindColumns: ['name', 'country'] },
    columns: COLUMNS,
})
`,
})

/** The entry, then the files the example adds or carries, then `data.ts`. */
export const withCapitals = (code: string, data: IGridExampleFile, ...files: IGridExampleFile[]): IGridExampleFile[] => [{ name: 'GridExample.tsx', code }, ...files, data]

/** The pins of Pins coloured by region: the region's colour, and a star on the largest capitals. */
export const REGION_PIN_FILE: IGridExampleFile = {
    name: 'RegionPin.tsx',
    code: `import { IMapUiMarkerComponents, IMapUiMarkerPinProps, Map, useMapRecord } from '@talxis/base-controls'
import { Icon } from '@fluentui/react'
import { REGIONS } from './data'

//the teardrop in the colour of the capital's region
export const RegionPin = (props: IMapUiMarkerPinProps) => {
    //the record of the pin being drawn
    const capital = useMapRecord()
    const color = REGIONS.find(region => region.Value === Number(capital.getValue('region')))?.Color
    return <Map.Ui.MarkerPin {...props} color={color} />
}

//a star in place of the dot for a capital of two million or more
export const CapitalDot = (props: React.HTMLAttributes<HTMLDivElement>) => {
    const isLarge = Number(useMapRecord().getValue('population')) >= 2000000
    //turned back upright inside the turned teardrop
    return isLarge ? <Icon iconName='FavoriteStarFill' style={{ color: 'white', fontSize: 12, transform: 'rotate(45deg)' }} /> : <div {...props} />
}

//the pin's slots, for components.marker.pin
export const REGION_PINS: Partial<IMapUiMarkerComponents> = {
    onRenderPin: props => <RegionPin {...props} />,
    onRenderDot: props => <CapitalDot {...props} />,
}
`,
}

/** The popup of A postcard for each capital, composed from the popup parts. */
export const POSTCARD_FILE: IGridExampleFile = {
    name: 'Postcard.tsx',
    code: `import { Map, Field, useMapRecord, useMapRecords } from '@talxis/base-controls'

//drawn in each pin's popup, where the hooks and Map.Popup's parts read the pin's record
export const Postcard = () => {
    const capital = useMapRecord()
    const largest = useMapRecords().reduce((a, b) => Number(a.getValue('population')) >= Number(b.getValue('population')) ? a : b)
    const share = Number(capital.getValue('population')) / Number(largest.getValue('population')) * 100

    return <>
        {/* the region beside the name, as a tag in its option's colour */}
        <Map.Popup.Header statusColumnName='region' />
        <Map.Popup.Body>
            <Map.Popup.FieldList>
                <Map.Popup.Field columnName='country' iconName='Flag' />
                {/* the shared Field parts take any value */}
                <Field.Value label='In the EU since' iconName='Calendar'>{capital.getValue('euSince')}</Field.Value>
                <Field.Progress percent={share} text={\`\${Math.round(share)}% of \${largest.getFormattedValue('name')}\`} />
            </Map.Popup.FieldList>
        </Map.Popup.Body>
    </>
}
`,
}
