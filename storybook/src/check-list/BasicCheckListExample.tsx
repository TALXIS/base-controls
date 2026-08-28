import React from 'react'
import { CheckListExampleRunner } from './CheckListExampleRunner'

/** Seed snippet of the example. `rows`, `columns` and `fieldMapping` come from the sandbox. */
export const BASIC_CHECK_LIST_CODE = `const CheckListExample = () => <CheckList
    onInitialize={() => ({
        data: rows,
        //the four mapped columns, plus one of your own
        columns: [...columns, {
            name: 'priority',
            dataType: 'OptionSet',
            displayName: 'Priority',
            visualSizeFactor: 120,
            metadata: {
                OptionSet: [
                    { Value: 0, Label: 'Low', Color: '#69797e' },
                    { Value: 1, Label: 'Normal', Color: '#0f6cbd' },
                    { Value: 2, Label: 'High', Color: '#a4262c' },
                ],
            },
        }],
        fieldMapping: fieldMapping,
    })} />
`

/** A checklist with the items, their columns and the mapping over them. Editable like every example. */
export const BasicCheckListExample = () => <CheckListExampleRunner seedCode={BASIC_CHECK_LIST_CODE} />
