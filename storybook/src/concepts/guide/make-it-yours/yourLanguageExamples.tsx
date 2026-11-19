import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { STORE_OPENINGS_TABS, withFinishedApp } from '../storeOpeningsFiles'

const YOUR_LANGUAGE_CODE = `import { ClientSideGrid, createAggregationModule, createEditingModule, createFilteringModule, createRowSelectionModule, createSortingModule, CZECH_LABELS, DatasetControl, IDatasetControlView, IGrid, LabelsProvider, Panel, useDatasetControl } from '@talxis/base-controls'
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
                ? <StoreMap />
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

//new: every label below it in Czech
const GridExample = () => <LabelsProvider labels={CZECH_LABELS}>
    <StoreOpenings />
</LabelsProvider>
`

export const YourLanguageExample = () => <GridExampleRunner seedCode={withFinishedApp({ name: 'GridExample.tsx', code: YOUR_LANGUAGE_CODE })} tabs={STORE_OPENINGS_TABS} />
