import type { IGridExampleFile } from '../../../grid/GridLivePreview'

export const USER_QUERIES_FILE: IGridExampleFile = {
    name: 'userQueries.ts',
    code: `import { captureViewData, getDealColumn, IDealViewData, where, withCopies } from './views'

const STORAGE_KEY = 'scratch.userQueries'

const USER_VIEWS: { id: string, name: string, columns: string[], hidden?: string[], data: IDealViewData }[] = [
    { id: 'ben', name: "Ben's deals", columns: ['name', 'stage', 'closedate'], hidden: ['owner'], data: { filtering: where('owner', Operators.Equal, 'Ben Carter'), sorting: [{ name: 'closedate', sortDirection: 1 }] } },
    { id: 'renewals', name: 'Renewals', columns: ['name', 'owner', 'closedate'], data: { searchQuery: '*renewal' } },
    { id: 'migrations', name: 'Migrations', columns: ['name', 'owner', 'value'], data: { searchQuery: '*migration', sorting: [{ name: 'value', sortDirection: 0 }] } },
    { id: 'likelyWins', name: 'Likely wins', columns: ['name', 'probability', 'value'], data: { filtering: where('probability', Operators.GreaterThanOrEqual, '70'), sorting: [{ name: 'probability', sortDirection: 1 }] } },
    { id: 'anna', name: "Board: Anna's pipeline", columns: ['name', 'stage', 'value'], hidden: ['owner'], data: { filtering: where('owner', Operators.Equal, 'Anna Novak'), layout: 'board' } },
    { id: 'contoso', name: 'Gallery: Contoso', columns: ['name', 'owner', 'value'], data: { searchQuery: 'Contoso', layout: 'gallery' } },
    { id: 'lost', name: 'Gallery: Lost deals', columns: ['name', 'owner', 'value'], hidden: ['stage'], data: { filtering: where('stage', Operators.Equal, '5'), layout: 'gallery' } },
    { id: 'closingSoon', name: 'Timeline: Closing soon', columns: ['name', 'owner', 'closedate'], data: { sorting: [{ name: 'closedate', sortDirection: 0 }], layout: 'timeline' } },
    { id: 'bigTickets', name: 'Leaderboard: Big tickets', columns: ['name', 'owner', 'value'], data: { filtering: where('value', Operators.GreaterThanOrEqual, '20000'), layout: 'leaderboard' } },
    { id: 'fabrikam', name: 'Gallery: Fabrikam by value', columns: ['name', 'stage', 'value'], data: { searchQuery: 'Fabrikam', sorting: [{ name: 'value', sortDirection: 1 }], layout: 'gallery' } },
]

//a long list to scroll, written once in the shape createLocalStorageUserQueriesModule keeps
const seedUserViews = () => {
    if (localStorage.getItem(STORAGE_KEY)) {
        return
    }
    const records = withCopies(USER_VIEWS, 3).map(({ id, name, columns, hidden = [], data }) => ({ id, name, view: JSON.stringify({ columns: [...columns.map((name, order) => ({ name, order })), ...hidden.map(name => ({ name, isHidden: true }))], data }) }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

/** The user's views of the deals, kept in this browser. */
export const createDealUserQueriesModule = () => {
    seedUserViews()
    return createLocalStorageUserQueriesModule<IDealViewData>({ storageKey: STORAGE_KEY, onGetViewData: captureViewData, onGetColumn: getDealColumn })
}
`,
}
