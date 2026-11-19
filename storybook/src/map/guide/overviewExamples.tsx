import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { CAPITAL_TABS, REGION_PIN_FILE, tripFile, withCapitals } from './capitalTripFiles'

const TRIP_PLANNER_CODE = `import { DatasetControl, ILeaflet, IRibbonCommand, LeafletMap, Map, useDataProvider, useDatasetControl, useEventEmitter, useMap, useMapModule, useMapRecords } from '@talxis/base-controls'
import type { IDataProviderEventListeners } from '@talxis/client-libraries'
import { DefaultButton, PrimaryButton, Stack } from '@fluentui/react'
import { FIELD_MAPPING, VISITED } from './data'
import { loadTrip } from './views'
import { TRIP_COMPONENTS } from './TripPostcard'

//covers the control while the provider loads, such as for a search
const LoadingCover = () => {
    const control = useDatasetControl()
    const hide = React.useRef<() => void>()
    useEventEmitter<IDataProviderEventListeners>(useDataProvider(), 'onLoading', isLoading => {
        hide.current?.()
        hide.current = isLoading ? control.loading.show('Loading map data…') : undefined
    })
    return null
}

//the ribbon calls onLoad again on every selection, such as one made in a popup
const TripRibbon = () => {
    const provider = useDataProvider()

    const onLoad = (): IRibbonCommand[] => {
        const capitals = provider.getSelectedRecordIds().map(id => provider.getRecordsMap()[id])
        if (capitals.length === 0) {
            return []
        }
        const markVisited = async () => {
            capitals.forEach(capital => capital.setValue('status', VISITED))
            await provider.save(capitals)
        }
        return [{ id: 'markVisited', label: \`Mark \${capitals.length} as visited\`, iconName: 'CheckMark', onExecute: markVisited }]
    }

    return <DatasetControl.Ribbon onLoad={onLoad} />
}

//flies Leaflet's own map from capital to capital, west to east
const Tour = () => {
    const map = useMap()
    const leaflet = useMapModule('library') as ILeaflet
    const stops = useMapRecords().sort((a, b) => map.getPoint(a)!.longitude - map.getPoint(b)!.longitude)
    const stop = React.useRef(-1)

    const next = () => {
        stop.current = (stop.current + 1) % stops.length
        const { latitude, longitude } = map.getPoint(stops[stop.current])!
        leaflet.getInstance()?.flyTo([latitude, longitude], 11)
    }

    const showAll = () => {
        stop.current = -1
        map.services.get('viewport').fit()
    }

    return <Stack horizontal tokens={{ childrenGap: 8 }}>
        <PrimaryButton text='Next capital' onClick={next} />
        <DefaultButton text='Show all' onClick={showAll} />
    </Stack>
}

//the map in the body draws the provider loadTrip returns
const GridExample = () => <DatasetControl onLoad={loadTrip} height='560px' components={{ skeleton: { onRender: props => <Map.Ui.Skeleton {...props} /> } }}>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <TripRibbon />
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <LeafletMap fieldMapping={FIELD_MAPPING} components={TRIP_COMPONENTS}>
            <LoadingCover />
            <Tour />
        </LeafletMap>
    </DatasetControl.Body>
</DatasetControl>
`

const TRIP_VIEWS_FILE: IGridExampleFile = {
    name: 'views.ts',
    code: `import { IDatasetControlLoadResult, IDatasetControlView } from '@talxis/base-controls'
import { IDataProvider, Operators, Type } from '@talxis/client-libraries'
import { COLUMNS, createCitiesProvider, VISITED, WISHLIST } from './data'

const getColumn = (name: string) => COLUMNS.find(column => column.name === name)!
//loaded for the pins and the postcard, never shown
const READ_BY_THE_MAP = ['lat', 'lng', 'status', 'region', 'population', 'euSince'].map(name => ({ ...getColumn(name), isHidden: true }))
const columns = [getColumn('name'), getColumn('country'), ...READ_BY_THE_MAP]

const filterByStatus = (provider: IDataProvider, status: number) => {
    provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'status', conditionOperator: Operators.Equal.Value, value: String(status) }] })
    return { columns }
}

const VIEWS: IDatasetControlView[] = [
    { id: 'all', name: 'All capitals', resolve: () => ({ columns }) },
    { id: 'wishlist', name: 'Wishlist', resolve: provider => filterByStatus(provider, WISHLIST) },
    { id: 'visited', name: 'Visited', resolve: provider => filterByStatus(provider, VISITED) },
]

export const loadTrip = async (): Promise<IDatasetControlLoadResult> => {
    const provider = createCitiesProvider()
    //a second per load, like a server, so the placeholder and the cover show
    const getDataAsync = provider.getDataAsync.bind(provider)
    provider.getDataAsync = async (...args: Parameters<typeof getDataAsync>) => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return getDataAsync(...args)
    }
    return { provider, views: VIEWS }
}
`,
}

const TRIP_POSTCARD_FILE: IGridExampleFile = {
    name: 'TripPostcard.tsx',
    code: `import { ILeafletComponents, IMapUiMarkerPinProps, Map, Field, useDataProviderEvents, useMapRecord, useMapRecords } from '@talxis/base-controls'
import { Link } from '@fluentui/react'
import { CapitalDot, RegionPin } from './RegionPin'

//the pin's capital, and whether it is in the control's selection
const useCapital = () => {
    const capital = useMapRecord()
    //the control's provider; draws again when the selection or a value changes
    const provider = useDataProviderEvents(['onRecordsSelected', 'onRecordColumnValueChanged'])
    const id = capital.getRecordId()
    const selectedIds = provider.getSelectedRecordIds()
    const isSelected = selectedIds.includes(id)
    const toggle = () => provider.setSelectedRecordIds(isSelected ? selectedIds.filter(selectedId => selectedId !== id) : [...selectedIds, id])
    return { capital, isSelected, toggle }
}

//dark while selected, otherwise in the colour of the capital's region
const TripPin = (props: IMapUiMarkerPinProps) => useCapital().isSelected ? <Map.Ui.MarkerPin {...props} color='#323130' /> : <RegionPin {...props} />

//the postcard, with the trip status as its tag and a link that selects the capital
const TripPostcard = () => {
    const { capital, isSelected, toggle } = useCapital()
    const largest = useMapRecords().reduce((a, b) => Number(a.getValue('population')) >= Number(b.getValue('population')) ? a : b, capital)
    const share = Number(capital.getValue('population')) / Number(largest.getValue('population')) * 100

    return <>
        <Map.Popup.Header statusColumnName='status' />
        <Map.Popup.Body>
            <Map.Popup.FieldList>
                <Map.Popup.Field columnName='country' iconName='Flag' />
                <Field.Value label='In the EU since' iconName='Calendar'>{capital.getValue('euSince')}</Field.Value>
                <Field.Progress percent={share} text={\`\${Math.round(share)}% of \${largest.getFormattedValue('name')}\`} />
            </Map.Popup.FieldList>
            <Link onClick={toggle}>{isSelected ? 'Deselect' : 'Select'}</Link>
        </Map.Popup.Body>
    </>
}

export const TRIP_COMPONENTS: ILeafletComponents = {
    marker: {
        pin: { onRenderPin: props => <TripPin {...props} />, onRenderDot: props => <CapitalDot {...props} /> },
        popup: { onRender: () => <TripPostcard /> },
    },
}
`,
}

export const TripPlannerShowcase = () => <GridExampleRunner seedCode={withCapitals(TRIP_PLANNER_CODE, tripFile('country', 'population', 'euSince', 'region', 'status'), TRIP_POSTCARD_FILE, TRIP_VIEWS_FILE, REGION_PIN_FILE)} tabs={CAPITAL_TABS} />
