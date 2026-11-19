import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../../grid/GridLivePreview'
import { STORE_OPENINGS_TABS, withFinishedApp } from '../storeOpeningsFiles'

const STORE_OPENINGS_EXPORTED_CODE = `import { ClientSideGrid, createAggregationModule, createEditingModule, createFilteringModule, createRowSelectionModule, createSortingModule, DatasetControl, IDatasetControlView, IGrid, Panel, useDatasetControl } from '@talxis/base-controls'
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

//new: exported for the PCF control in index.tsx
export const StoreOpenings = () => {
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

const STORES_RIBBON_CONFIRMING_FILE: IGridExampleFile = {
    name: 'StoresRibbon.tsx',
    code: `import { DatasetControl, IRibbonCommand, useDataProvider, useDatasetControl, usePcfContext } from '@talxis/base-controls'
import { OPEN } from './stores'

//DatasetControl.Ribbon calls onLoad again on every selection
export const StoresRibbon = () => {
    const provider = useDataProvider()
    const control = useDatasetControl()
    //new: the host's dialogs, or the browser's own outside Power Apps
    const { navigation } = usePcfContext()

    const markOpen = async (storeIds: string[]) => {
        //new: nothing changes unless the user confirms
        const { confirmed } = await navigation.openConfirmDialog({ title: 'Mark as open', text: 'Mark ' + storeIds.length + ' as open?' })
        if (!confirmed) {
            return
        }
        const stores = storeIds.map(id => provider.getRecordsMap()[id])
        stores.forEach(store => store.setValue('status', OPEN))
        await provider.save(stores)
        //the same selection now has other commands
        await control.parts.get('ribbon').reload()
    }

    const onLoad = (): IRibbonCommand[] => {
        const notOpenIds = provider.getSelectedRecordIds().filter(id => Number(provider.getRecordsMap()[id].getValue('status')) !== OPEN)
        return notOpenIds.length > 0 ? [{ id: 'markOpen', label: 'Mark ' + notOpenIds.length + ' as open', iconName: 'Shop', onExecute: () => markOpen(notOpenIds) }] : []
    }

    //Save and Discard changes act on every unsaved store
    return <DatasetControl.Ribbon enableSave enableDiscard onLoad={onLoad} />
}
`,
}

const PCF_CONTROL_FILE: IGridExampleFile = {
    name: 'index.tsx',
    code: `import ReactDOM from 'react-dom'
import { AppThemeProvider, PcfContextProvider } from '@talxis/base-controls'
import { StoreOpenings } from './GridExample'

//not run on this page: the app as a PCF control
export class StoreOpeningsControl implements ComponentFramework.StandardControl<{}, {}> {
    private _container!: HTMLDivElement

    public init(context: ComponentFramework.Context<{}>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {
        this._container = container
    }

    public updateView(context: ComponentFramework.Context<{}>) {
        ReactDOM.render(<PcfContextProvider context={context}>
            <AppThemeProvider>
                <StoreOpenings />
            </AppThemeProvider>
        </PcfContextProvider>, this._container)
    }

    public destroy() {
        ReactDOM.unmountComponentAtNode(this._container)
    }
}
`,
}

export const InPowerAppsExample = () => <GridExampleRunner seedCode={withFinishedApp({ name: 'GridExample.tsx', code: STORE_OPENINGS_EXPORTED_CODE }, STORES_RIBBON_CONFIRMING_FILE, PCF_CONTROL_FILE)} tabs={STORE_OPENINGS_TABS} />
