import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../../grid/GridLivePreview'
import { STORE_OPENINGS_TABS, withFinishedApp } from '../storeOpeningsFiles'

const CHANGE_WHAT_A_PART_DRAWS_CODE = `import { ClientSideGrid, createAggregationModule, createEditingModule, createFilteringModule, createRowSelectionModule, createSortingModule, DatasetControl, IDatasetControlView, IGrid, Panel, useDatasetControl } from '@talxis/base-controls'
import { IRecord, Operators, Type } from '@talxis/client-libraries'
import { PanelType } from '@fluentui/react'
import { createStoresProvider, OPEN, VIEW_COLUMNS } from './stores'
import { StoresRibbon } from './StoresRibbon'
import { StoreForm } from './StoreForm'
import { StoreMap } from './StoreMap'

//what a view draws the stores with, read through getView().data
interface IStoreViewData {
    ui: 'map'
}

const VIEWS: IDatasetControlView<IStoreViewData>[] = [
    { id: 'all', name: 'All stores', resolve: () => ({ columns: VIEW_COLUMNS }) },
    {
        id: 'notopen',
        name: 'Not open yet',
        //the stores still to open, soonest first
        resolve: provider => {
            provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'status', conditionOperator: Operators.DoesNotEqual.Value, value: String(OPEN) }] })
            provider.setSorting([{ name: 'openingdate', sortDirection: 0 }])
            return { columns: VIEW_COLUMNS }
        },
    },
    { id: 'map', name: 'On the map', resolve: () => ({ columns: VIEW_COLUMNS, data: { ui: 'map' } }) },
]

const loadStores = async () => ({ provider: createStoresProvider(), views: VIEWS })

interface IStoresProps {
    onOpenStore: (store: IRecord) => void
}

//mounted anew by the control for every view
const Stores = (props: IStoresProps) => {
    const isMap = useDatasetControl<IStoreViewData>().getView()?.data?.ui === 'map'

    const onSetup = (grid: IGrid) => {
        //a click on a store's name opens it through this hook
        grid.hooks.openRecord.add(request => {
            //a handled request is not passed on to the provider
            request.isHandled = true
            props.onOpenStore(request.record)
        })
    }

    return <>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher />
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <StoresRibbon />
                {/* only the grid shows the columns it changes */}
                {!isMap && <DatasetControl.EditColumns />}
                <DatasetControl.QuickFind />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            {/* both draw the control's provider and follow its quick find */}
            {isMap
                //new: the popup's link opens the store in the same panel
                ? <StoreMap onOpenStore={props.onOpenStore} />
                : <ClientSideGrid
                    onSetup={onSetup}
                    enableOptionSetColors
                    modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule(), createFilteringModule(), createAggregationModule()]} />}
        </DatasetControl.Body>
    </>
}

const StoreOpenings = () => {
    const [openedStore, setOpenedStore] = React.useState<IRecord>()

    return <>
        <DatasetControl onLoad={loadStores} height='520px'>
            <Stores onOpenStore={setOpenedStore} />
        </DatasetControl>
        <Panel isOpen={!!openedStore} type={PanelType.extraLarge} headerText={openedStore?.getNamedReference().name} isLightDismiss onDismiss={() => setOpenedStore(undefined)}>
            {openedStore && <StoreForm key={openedStore.getRecordId()} store={openedStore} />}
        </Panel>
    </>
}

const GridExample = () => <StoreOpenings />
`

const STORE_MAP_SLOTS_FILE: IGridExampleFile = {
    name: 'StoreMap.tsx',
    code: `import { IMapUiMarkerPinProps, LeafletMap, Map, useMapRecord } from '@talxis/base-controls'
import type { IRecord } from '@talxis/client-libraries'
import { Link } from '@fluentui/react'
import { STATUSES } from './stores'

interface IStoreMapProps {
    onOpenStore: (store: IRecord) => void
}

//new: a pin in the colour of the store's status
const StorePin = (props: IMapUiMarkerPinProps) => {
    const status = Number(useMapRecord().getValue('status'))
    return <Map.Ui.MarkerPin {...props} color={STATUSES.find(option => option.Value === status)?.Color} />
}

//new: a pin's popup with a link that opens the store, as its name in the grid does
const StorePopup = (props: IStoreMapProps) => {
    const store = useMapRecord()
    return <>
        <Map.Popup.Header statusColumnName='status' />
        <Map.Popup.Body>
            <Map.Popup.FieldRows>
                <Map.Popup.FieldRow columnName='manager' iconName='Contact' />
                <Map.Popup.FieldRow columnName='openingdate' iconName='Calendar' />
            </Map.Popup.FieldRows>
            <Link onClick={() => props.onOpenStore(store)}>Open the store</Link>
        </Map.Popup.Body>
    </>
}

export const StoreMap = (props: IStoreMapProps) => <LeafletMap fieldMapping={{ latitude: 'lat', longitude: 'lng' }} components={{
    //new: the slots that draw each pin and its popup
    marker: {
        pin: { onRenderPin: pinProps => <StorePin {...pinProps} /> },
        popup: { onRender: () => <StorePopup {...props} /> },
    },
}} />
`,
}

export const ChangeWhatAPartDrawsExample = () => <GridExampleRunner seedCode={withFinishedApp({ name: 'GridExample.tsx', code: CHANGE_WHAT_A_PART_DRAWS_CODE }, STORE_MAP_SLOTS_FILE)} tabs={STORE_OPENINGS_TABS} />
