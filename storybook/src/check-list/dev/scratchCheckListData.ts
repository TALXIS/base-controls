import { DataTypes, IColumn, IMemoryProviderEntityMetadata, IRawRecord, MemoryDataProvider } from '@talxis/client-libraries'

export const ENTITY_NAME = 'mem_checklistitem'
export const PRIMARY_ID = 'mem_checklistitemid'
export const NAME_COL = 'name'
export const STACK_RANK_COL = 'stackrank'
export const STATUS_COL = 'statuscode'

const ENTITY_METADATA: IMemoryProviderEntityMetadata = {
    PrimaryIdAttribute: PRIMARY_ID,
    PrimaryNameAttribute: NAME_COL,
    LogicalName: ENTITY_NAME,
}

const COLUMNS: IColumn[] = [
    {
        name: NAME_COL,
        dataType: DataTypes.SingleLineText,
        displayName: 'Item',
        isPrimary: true,
        visualSizeFactor: 320,
    },
    {
        name: STATUS_COL,
        dataType: DataTypes.OptionSet,
        displayName: 'Status',
        visualSizeFactor: 140,
        metadata: {
            OptionSet: [
                { Value: 0, Label: 'Open', Color: '#69797e' },
                { Value: 1, Label: 'Done', Color: '#107c10' },
            ],
        },
    },
    {
        name: STACK_RANK_COL,
        dataType: DataTypes.SingleLineText,
        displayName: 'Rank',
        visualSizeFactor: 90,
    },
]

//ranks are lexorank-style strings, the same shape the task grid orders on
//deliberately out of rank order in the source, so the mapping's sort is visibly doing something
const DATA_SOURCE: IRawRecord[] = [
    { [PRIMARY_ID]: 'item-4', [NAME_COL]: 'Wire the ribbon commands', [STATUS_COL]: 0, [STACK_RANK_COL]: '0|400000:' },
    { [PRIMARY_ID]: 'item-1', [NAME_COL]: 'Pick a data provider', [STATUS_COL]: 1, [STACK_RANK_COL]: '0|100000:' },
    { [PRIMARY_ID]: 'item-5', [NAME_COL]: 'Ship it', [STATUS_COL]: 0, [STACK_RANK_COL]: '0|500000:' },
    { [PRIMARY_ID]: 'item-2', [NAME_COL]: 'Map name, stack rank and status', [STATUS_COL]: 1, [STACK_RANK_COL]: '0|200000:' },
    { [PRIMARY_ID]: 'item-3', [NAME_COL]: 'Render the CheckList', [STATUS_COL]: 0, [STACK_RANK_COL]: '0|300000:' },
]

/** A throwaway in-memory provider carrying the three columns the checklist maps. */
export const createScratchProvider = (): MemoryDataProvider => {
    const provider = new MemoryDataProvider({
        dataSource: DATA_SOURCE.map(record => ({ ...record })),
        metadata: ENTITY_METADATA,
    })
    provider.setColumns(COLUMNS)
    return provider
}
