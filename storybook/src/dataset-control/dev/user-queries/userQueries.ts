import type { IGridExampleFile } from '../../../grid/GridLivePreview'

export const USER_QUERIES_FILE: IGridExampleFile = {
    name: 'userQueries.ts',
    code: `import { getCurrentView, getDefinition, IDealViewData, IDealViewDefinition, readDefinition, where, withCopies } from './views'

const USER_VIEWS: { id: string, name: string, description: string, definition: IDealViewDefinition }[] = [
    { id: 'ben', name: "Ben's deals", description: 'Owned by Ben Carter, latest close first', definition: { columns: ['name', 'stage', 'closedate'], filtering: where('owner', Operators.Equal, 'Ben Carter'), sorting: [{ name: 'closedate', sortDirection: 1 }] } },
    { id: 'renewals', name: 'Renewals', description: 'Every support renewal', definition: { columns: ['name', 'owner', 'closedate'], searchQuery: '*renewal' } },
    { id: 'migrations', name: 'Migrations', description: 'Data migrations, smallest first', definition: { columns: ['name', 'owner', 'value'], searchQuery: '*migration', sorting: [{ name: 'value', sortDirection: 0 }] } },
    { id: 'likelyWins', name: 'Likely wins', description: '70 % or more, most likely first', definition: { columns: ['name', 'probability', 'value'], filtering: where('probability', Operators.GreaterThanOrEqual, '70'), sorting: [{ name: 'probability', sortDirection: 1 }] } },
    { id: 'anna', name: "Board: Anna's pipeline", description: 'Owned by Anna Novak, by stage', definition: { columns: ['name', 'stage', 'value'], filtering: where('owner', Operators.Equal, 'Anna Novak'), layout: 'board' } },
    { id: 'contoso', name: 'Gallery: Contoso', description: 'Found by searching Contoso', definition: { columns: ['name', 'owner', 'value'], searchQuery: 'Contoso', layout: 'gallery' } },
    { id: 'lost', name: 'Gallery: Lost deals', description: 'Every lost deal', definition: { columns: ['name', 'owner', 'value'], filtering: where('stage', Operators.Equal, '5'), layout: 'gallery' } },
    { id: 'closingSoon', name: 'Timeline: Closing soon', description: 'Earliest close date first', definition: { columns: ['name', 'owner', 'closedate'], sorting: [{ name: 'closedate', sortDirection: 0 }], layout: 'timeline' } },
    { id: 'bigTickets', name: 'Leaderboard: Big tickets', description: 'Who owns the deals worth 20,000 or more', definition: { columns: ['name', 'owner', 'value'], filtering: where('value', Operators.GreaterThanOrEqual, '20000'), layout: 'leaderboard' } },
    { id: 'fabrikam', name: 'Gallery: Fabrikam by value', description: 'Fabrikam, biggest first', definition: { columns: ['name', 'stage', 'value'], searchQuery: 'Fabrikam', sorting: [{ name: 'value', sortDirection: 1 }], layout: 'gallery' } },
]

/** The user's views, one record each, with the definition kept as JSON. */
export const createUserQueriesProvider = () => new MemoryDataProvider({
    dataSource: withCopies(USER_VIEWS, 3).map(view => ({ id: view.id, name: view.name, description: view.description, definition: JSON.stringify(view.definition) })),
    metadata: { PrimaryIdAttribute: 'id', PrimaryNameAttribute: 'name', QuickFindColumns: ['name', 'description'] },
    columns: [
        { name: 'name', displayName: 'View name', dataType: DataTypes.SingleLineText, isPrimary: true, visualSizeFactor: 200 },
        { name: 'description', displayName: 'Description', dataType: DataTypes.Multiple, visualSizeFactor: 300 },
        { name: 'definition', displayName: 'Definition', dataType: DataTypes.Multiple, isHidden: true },
    ],
})

/** A user view carries its definition the way a system view does. */
export const readViewData = (record: IRecord): IDealViewData => ({ definition: JSON.parse(record.getValue('definition')) })

/** Saving a view, new or changed, keeps what the control shows, drawn the way the current view draws it. */
export const writeViewData = ({ record, datasetControl }: IUserQueryWriteParameters) => {
    const provider = datasetControl.getProvider()
    if (provider) {
        const layout = getDefinition(getCurrentView(datasetControl)).layout
        record.setValue('definition', JSON.stringify({ ...readDefinition(provider), layout }))
    }
}
`,
}
