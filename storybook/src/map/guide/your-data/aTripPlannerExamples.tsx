import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../../grid/GridLivePreview'
import { CAPITAL_TABS, tripFile, withCapitals } from '../capitalTripFiles'

const A_TRIP_PLANNER_CODE = `import { DatasetControl, IRibbonCommand, LeafletMap, Map, useDataProvider, useDatasetControl, useEventEmitter } from '@talxis/base-controls'
import type { IDataProviderEventListeners } from '@talxis/client-libraries'
import { FIELD_MAPPING, VISITED } from './data'
import { loadTrip } from './views'
import { CAPITAL_COMPONENTS } from './CapitalCard'

//new: covers the control while the provider loads, such as for a quick find
const LoadingCover = () => {
    const control = useDatasetControl()
    const hide = React.useRef<() => void>()
    useEventEmitter<IDataProviderEventListeners>(useDataProvider(), 'onLoading', isLoading => {
        hide.current?.()
        hide.current = isLoading ? control.loading.show('Loading map data…') : undefined
    })
    return null
}

//new: the ribbon calls onLoad again on every selection, such as one made in a popup
const TripRibbon = () => {
    const provider = useDataProvider()

    const onLoad = (): IRibbonCommand[] => {
        const capitals = provider.getSelectedRecordIds().map(id => provider.getRecordsMap()[id])
        if (capitals.length === 0) {
            return []
        }
        const markVisited = async () => {
            capitals.forEach(capital => capital.setValue('status', VISITED))
            //saved at once, so it leaves no unsaved changes behind
            await provider.save(capitals)
        }
        return [{ id: 'markVisited', label: \`Mark \${capitals.length} as visited\`, iconName: 'CheckMark', onExecute: markVisited }]
    }

    return <DatasetControl.Ribbon onLoad={onLoad} />
}

const GridExample = () => <DatasetControl onLoad={loadTrip} height='560px' components={{
    //new: a map in place of the grid-shaped placeholder while the control loads
    skeleton: { onRender: props => <Map.Ui.Skeleton {...props} /> },
}}>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <TripRibbon />
            <DatasetControl.EditColumns />
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    {/* new: the map takes no provider of its own: it draws the control's */}
    <DatasetControl.Body>
        <LeafletMap fieldMapping={FIELD_MAPPING} components={CAPITAL_COMPONENTS}>
            <LoadingCover />
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
//loaded for the pins and the popup's header, never shown
const READ_BY_THE_MAP = ['lat', 'lng', 'status'].map(name => ({ ...getColumn(name), isHidden: true }))
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
    //what Edit columns offers: a memory provider lists the columns of its saved queries
    provider.setMetadata({ ...provider.getMetadata(), SavedQueries: [{ columns: ['name', 'country', 'population'].map(getColumn) }] })
    return { provider, views: VIEWS }
}
`,
}

const CAPITAL_CARD_FILE: IGridExampleFile = {
    name: 'CapitalCard.tsx',
    code: `import { ILeafletComponents, IMapUiMarkerPinProps, Map, useDataProviderEvents, useMapRecord } from '@talxis/base-controls'
import { Link } from '@fluentui/react'
import { STATUSES } from './data'

//the pin's capital, and whether it is in the control's selection
const useCapital = () => {
    const capital = useMapRecord()
    //the control's provider; draws again when the selection or a value changes
    const provider = useDataProviderEvents(['onRecordsSelected', 'onRecordColumnValueChanged'])
    const id = capital.getRecordId()
    const selectedIds = provider.getSelectedRecordIds()
    const isSelected = selectedIds.includes(id)
    const toggle = () => provider.setSelectedRecordIds(isSelected ? selectedIds.filter(selectedId => selectedId !== id) : [...selectedIds, id])
    return { capital, provider, isSelected, toggle }
}

//dark while selected, otherwise in the colour of the trip status
const CapitalPin = (props: IMapUiMarkerPinProps) => {
    const { capital, isSelected } = useCapital()
    const color = isSelected ? '#323130' : STATUSES.find(status => status.Value === Number(capital.getValue('status')))?.Color
    return <Map.Ui.MarkerPin {...props} color={color} />
}

//a row for each column the view shows now, so Edit columns changes the popup
const CapitalCard = () => {
    const { provider, isSelected, toggle } = useCapital()
    //the name is in the header; the hidden columns are the ones the map reads
    const columns = provider.getColumns().filter(column => !column.isHidden && !column.isPrimary)

    return <>
        <Map.Popup.Header statusColumnName='status' />
        <Map.Popup.Body>
            <Map.Popup.FieldList>
                {columns.map(column => <Map.Popup.Field key={column.name} columnName={column.name} />)}
            </Map.Popup.FieldList>
            <Link onClick={toggle}>{isSelected ? 'Deselect' : 'Select'}</Link>
        </Map.Popup.Body>
    </>
}

export const CAPITAL_COMPONENTS: ILeafletComponents = {
    marker: {
        pin: { onRenderPin: props => <CapitalPin {...props} /> },
        popup: { onRender: () => <CapitalCard /> },
    },
}
`,
}

export const ATripPlannerExample = () => <GridExampleRunner seedCode={withCapitals(A_TRIP_PLANNER_CODE, tripFile('country', 'population', 'status'), TRIP_VIEWS_FILE, CAPITAL_CARD_FILE)} tabs={CAPITAL_TABS} />
