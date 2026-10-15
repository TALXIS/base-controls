import type { IGridExampleFile } from '../../grid/GridLivePreview'

/** Three views of the deals, one of them personal, loaded the way a server would. */
export const VIEWS_FILE: IGridExampleFile = {
    name: 'views.ts',
    code: `interface IDealView extends IDatasetControlView {
    columns: string[]
    sorting?: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[]
    filtering?: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression
}

//each view shows its own columns, filter and sorting
const VIEWS: IDealView[] = [
    { id: 'all', name: 'All deals', columns: ['name', 'owner', 'stage', 'value', 'probability', 'closedate'] },
    { id: 'won', name: 'Won deals', columns: ['name', 'owner', 'value', 'closedate'], filtering: { filterOperator: 0, conditions: [{ attributeName: 'stage', conditionOperator: 0, value: '4' }] } },
    { id: 'biggest', name: 'Biggest deals', group: 'My views', columns: ['name', 'value', 'stage'], sorting: [{ name: 'value', sortDirection: 1 }] },
]

//the deals as one view shows them
const createViewProvider = (view: IDealView) => {
    const provider = new MemoryDataProvider({
        dataSource: DEAL_ROWS.map(row => ({ ...row })),
        metadata: { PrimaryIdAttribute: DEAL_PRIMARY_ID, PrimaryNameAttribute: 'name', LogicalName: 'docs_deal', EntitySetName: 'docs_deals' },
        columns: DEAL_COLUMNS.map(column => ({ ...column, isPrimary: column.name === 'name', isHidden: !view.columns.includes(column.name), order: view.columns.indexOf(column.name) })),
    })
    provider.setSorting(view.sorting ?? [])
    provider.setFiltering(view.filtering ?? null)
    //every deal column can be added back in Edit columns
    provider.onGetAvailableColumns = async () => DEAL_COLUMNS
    return provider
}

export const loadDeals = async (params: IDatasetControlLoadParameters): Promise<IDatasetControlLoadResult> => {
    //stands in for fetching the view and the metadata from a server
    await new Promise(resolve => setTimeout(resolve, 800))
    const view = VIEWS.find(view => view.id === params.viewId) ?? VIEWS[0]
    return { provider: createViewProvider(view), viewId: view.id }
}

//what the view switcher lists
export const loadDealViews = async (): Promise<IDatasetControlView[]> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    return VIEWS.map(({ id, name, group }) => ({ id, name, group }))
}
`,
}

/** The commands of a sales pipeline, which change with what is selected. */
export const RIBBON_FILE: IGridExampleFile = {
    name: 'DealsRibbon.tsx',
    code: `const WON_STAGE = 4

//which buttons show depends on what is selected; DatasetControl.Ribbon loads them again on every selection
export const DealsRibbon = () => {
    const provider = useDataProvider()
    const control = useDatasetControl()

    const setStage = async (recordIds: string[], stage: number) => {
        //stands in for a server call, during which the button is disabled
        await new Promise(resolve => setTimeout(resolve, 1500))
        recordIds.forEach(id => provider.getRecordsMap()[id].setValue('stage', stage))
        //the selection is the same, but which buttons apply to it is not
        control.parts.get('ribbon').reload()
    }

    const onLoad = async (): Promise<IRibbonCommand[]> => {
        const selectedIds = provider.getSelectedRecordIds()
        const commands: IRibbonCommand[] = [{ id: 'refresh', label: 'Refresh', iconName: 'Refresh', onExecute: async () => { await provider.refresh() } }]
        if (selectedIds.length === 0) {
            return commands
        }
        const openIds = selectedIds.filter(id => provider.getRecordsMap()[id].getValue('stage') !== WON_STAGE)
        if (openIds.length > 0) {
            commands.push({ id: 'markWon', label: \`Mark \${openIds.length} as won\`, iconName: 'Trophy2', onExecute: () => setStage(openIds, WON_STAGE) })
        }
        if (openIds.length < selectedIds.length) {
            commands.push({ id: 'reopen', label: 'Reopen', iconName: 'Undo', onExecute: () => setStage(selectedIds.filter(id => !openIds.includes(id)), 1) })
        }
        if (selectedIds.length === 1) {
            const name = provider.getRecordsMap()[selectedIds[0]].getValue('name')
            commands.push({ id: 'copyName', label: 'Copy name', iconName: 'Copy', tooltip: name, onExecute: () => navigator.clipboard.writeText(name) })
        }
        commands.push({ id: 'clearSelection', label: 'Clear selection', iconName: 'Clear', onExecute: () => provider.clearSelectedRecordIds() })
        return commands
    }

    return <DatasetControl.Ribbon onLoad={onLoad} />
}
`,
}

/** The example's own file, with the shared ones it imports. */
export const withFiles = (code: string, ...files: IGridExampleFile[]): IGridExampleFile[] => [{ name: 'GridExample.tsx', code }, ...files]
