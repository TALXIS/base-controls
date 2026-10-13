import type { IDatasetControlLoadParameters, IDatasetControlLoadResult, IDatasetControlView } from '@talxis/base-controls'
import { IColumn, MemoryDataProvider } from '@talxis/client-libraries'
import { DEAL_COLUMNS, DEAL_PRIMARY_ID, DEAL_ROWS } from '../grid/data'

interface IDealView extends IDatasetControlView {
    columns: string[]
    sorting?: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[]
    filtering?: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression
}

const DEAL_VIEWS: IDealView[] = [
    { id: 'all', name: 'All deals', columns: ['name', 'owner', 'stage', 'value', 'probability', 'closedate'] },
    {
        id: 'won',
        name: 'Won deals',
        columns: ['name', 'owner', 'value', 'closedate'],
        filtering: { filterOperator: 0, conditions: [{ attributeName: 'stage', conditionOperator: 0, value: '4' }] },
    },
    { id: 'biggest', name: 'Biggest deals', group: 'My views', columns: ['name', 'value', 'stage'], sorting: [{ name: 'value', sortDirection: 1 }] },
]

//the deals as one view shows them
class DealsProvider extends MemoryDataProvider {
    constructor(view: IDealView) {
        super({
            dataSource: DEAL_ROWS.map(row => ({ ...row })),
            metadata: { PrimaryIdAttribute: DEAL_PRIMARY_ID, PrimaryNameAttribute: 'name', LogicalName: 'docs_deal', EntitySetName: 'docs_deals' },
            columns: DEAL_COLUMNS.map(column => ({ ...column, isPrimary: column.name === 'name', isHidden: !view.columns.includes(column.name), order: view.columns.indexOf(column.name) })),
        })
        this.setSorting(view.sorting ?? [])
        this.setFiltering(view.filtering ?? null)
        this.setViewId(view.id)
    }

    //every deal column can be added back in Edit columns
    public async onGetAvailableColumns(): Promise<IColumn[]> {
        return DEAL_COLUMNS
    }
}

/** A deals provider for the view asked for, the first view when none is; loads like a server would. */
export const loadDeals = async (params: IDatasetControlLoadParameters): Promise<IDatasetControlLoadResult> => {
    await new Promise(resolve => setTimeout(resolve, 600))
    const view = DEAL_VIEWS.find(view => view.id === params.viewId) ?? DEAL_VIEWS[0]
    return { provider: new DealsProvider(view), viewId: view.id }
}

/** The deal views, for the view switcher; loads like a server would. */
export const loadDealViews = async (): Promise<IDatasetControlView[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return DEAL_VIEWS.map(({ id, name, group }) => ({ id, name, group }))
}
