import { DataTypes } from '@talxis/client-libraries'
import type { IColumn, IRawRecord } from '@talxis/client-libraries'
import type { ICheckListFieldMapping } from '@talxis/base-controls'

export const PRIMARY_ID = 'itemid'
export const NAME_COL = 'name'
export const STACK_RANK_COL = 'stackrank'
export const COMPLETED_COL = 'completed'
/** Not mapped and not in the base columns: the extra column the examples add themselves. */
export const PRIORITY_COL = 'priority'

/** The four columns the checklist maps. Everything else a story adds is its own. */
export const CHECK_LIST_DOCS_COLUMNS: IColumn[] = [
    {
        name: NAME_COL,
        dataType: DataTypes.SingleLineText,
        displayName: 'Item',
        visualSizeFactor: 320,
        metadata: {
            //an item with no name is not an item, so every example has the requirement on
            RequiredLevel: 1,
        },
    },
    {
        name: COMPLETED_COL,
        dataType: DataTypes.TwoOptions,
        displayName: 'Completed',
        visualSizeFactor: 120,
        metadata: {
            OptionSet: [
                { Value: 1, Label: 'Yes', Color: '' },
                { Value: 0, Label: 'No', Color: '' },
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

export const CHECK_LIST_DOCS_FIELD_MAPPING: ICheckListFieldMapping = {
    id: PRIMARY_ID,
    name: NAME_COL,
    stackRank: STACK_RANK_COL,
    completed: COMPLETED_COL,
}

/**
 * The items the examples start from. Ranks are lexorank strings and deliberately out of order in the
 * source, so the ordering the checklist applies is visible. Every row carries a `priority`, which shows
 * up only once a story puts a column for it in the array.
 */
export const CHECK_LIST_DOCS_ROWS: IRawRecord[] = [
    { [PRIMARY_ID]: '3', [NAME_COL]: 'Ship the first version', [COMPLETED_COL]: false, [PRIORITY_COL]: 2, [STACK_RANK_COL]: '0|300000:' },
    { [PRIMARY_ID]: '1', [NAME_COL]: 'Sketch the layout', [COMPLETED_COL]: true, [PRIORITY_COL]: 1, [STACK_RANK_COL]: '0|100000:' },
    { [PRIMARY_ID]: '4', [NAME_COL]: 'Write the docs', [COMPLETED_COL]: false, [PRIORITY_COL]: 0, [STACK_RANK_COL]: '0|400000:' },
    { [PRIMARY_ID]: '2', [NAME_COL]: 'Wire up the data', [COMPLETED_COL]: true, [PRIORITY_COL]: 2, [STACK_RANK_COL]: '0|200000:' },
]
