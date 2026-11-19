import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { STORE_FORM_FILE, STORE_OPENINGS_TABS, STORES_RIBBON_FILE, withStoreOpenings } from '../storeOpeningsFiles'

const OPEN_A_STORE_IN_A_FORM_CODE = `import { ClientSideGrid, createAggregationModule, createEditingModule, createFilteringModule, createRowSelectionModule, createSortingModule, DatasetControl, IDatasetControlView, IGrid, Panel } from '@talxis/base-controls'
import { IRecord, Operators, Type } from '@talxis/client-libraries'
import { PanelType } from '@fluentui/react'
import { createStoresProvider, OPEN, VIEW_COLUMNS } from './stores'
import { StoresRibbon } from './StoresRibbon'
import { StoreForm } from './StoreForm'

const VIEWS: IDatasetControlView[] = [
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
]

const loadStores = async () => ({ provider: createStoresProvider(), views: VIEWS })

//new: how the list hands a clicked store to the app
interface IStoresProps {
    onOpenStore: (store: IRecord) => void
}

//mounted anew by the control for every view
const Stores = (props: IStoresProps) => {
    //new: gets each new grid before it loads
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
                <DatasetControl.EditColumns />
                <DatasetControl.QuickFind />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            {/* new: hands each new grid to onSetup */}
            <ClientSideGrid
                onSetup={onSetup}
                enableOptionSetColors
                modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule(), createFilteringModule(), createAggregationModule()]} />
        </DatasetControl.Body>
    </>
}

const StoreOpenings = () => {
    //new: the store open in the panel
    const [openedStore, setOpenedStore] = React.useState<IRecord>()

    return <>
        <DatasetControl onLoad={loadStores} height='520px'>
            <Stores onOpenStore={setOpenedStore} />
        </DatasetControl>
        {/* new: the form edits the grid's own record */}
        <Panel isOpen={!!openedStore} type={PanelType.extraLarge} headerText={openedStore?.getNamedReference().name} isLightDismiss onDismiss={() => setOpenedStore(undefined)}>
            {openedStore && <StoreForm key={openedStore.getRecordId()} store={openedStore} />}
        </Panel>
    </>
}

const GridExample = () => <StoreOpenings />
`

const OPEN_A_STORE_IN_A_FORM_FILES = withStoreOpenings(OPEN_A_STORE_IN_A_FORM_CODE, STORES_RIBBON_FILE, STORE_FORM_FILE)

export const OpenAStoreInAFormExample = () => <GridExampleRunner seedCode={OPEN_A_STORE_IN_A_FORM_FILES} tabs={STORE_OPENINGS_TABS} />
