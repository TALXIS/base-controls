import type { IGridExampleFile } from '../../grid/GridLivePreview'

/** Three views of the deals, one of them a report, each setting the provider up as it opens. */
export const VIEWS_FILE: IGridExampleFile = {
    name: 'views.ts',
    code: `const getDealColumn = (name: string) => DEAL_COLUMNS.find(column => column.name === name)!

//the deal columns a view shows, in the order it shows them
const columns = (...names: string[]) => names.map((name, order) => ({ ...getDealColumn(name), order }))
//what a view filters by without showing it
const hidden = (...names: string[]) => names.map(name => ({ ...getDealColumn(name), isHidden: true }))

//listed by name; a view sets the provider up as it is opened
const VIEWS: IDatasetControlView[] = [
    { id: 'all', name: 'All deals', resolve: () => ({ columns: columns('name', 'owner', 'stage', 'value', 'probability', 'closedate') }) },
    {
        id: 'won',
        name: 'Won deals',
        resolve: provider => {
            provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'stage', conditionOperator: Operators.Equal.Value, value: '4' }] })
            return { columns: [...columns('name', 'owner', 'value', 'closedate'), ...hidden('stage')] }
        },
    },
    {
        id: 'biggest',
        name: 'Biggest deals',
        group: { id: 'reports', name: 'Reports' },
        resolve: provider => {
            //sortDirection 1 is descending
            provider.setSorting([{ name: 'value', sortDirection: 1 }])
            return { columns: columns('name', 'value', 'stage') }
        },
    },
]

//offers every deal column to Edit columns and user views, not only the ones a view shows
class DealsProvider extends MemoryDataProvider {
    public async onGetAvailableColumns() {
        return DEAL_COLUMNS
    }
}

//the provider and the views to switch between; the control opens a view on the provider
export const loadDeals = async (): Promise<IDatasetControlLoadResult> => {
    //stands in for fetching the metadata from a server
    await new Promise(resolve => setTimeout(resolve, 800))
    //a new provider on every load: a view switch or reload mounts everything anew
    const provider = new DealsProvider({
        dataSource: DEAL_ROWS.map(row => ({ ...row })),
        metadata: { PrimaryIdAttribute: DEAL_PRIMARY_ID, PrimaryNameAttribute: 'name', QuickFindColumns: ['name'], LogicalName: 'docs_deal', EntitySetName: 'docs_deals' },
    })
    return { provider, views: VIEWS }
}
`,
}

/** The example's own file, with the shared ones it imports. */
export const withFiles = (code: string, ...files: IGridExampleFile[]): IGridExampleFile[] => [{ name: 'GridExample.tsx', code }, ...files]
