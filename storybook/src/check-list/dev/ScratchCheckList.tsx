import React from 'react'
import { CheckList, ICheckListFieldMapping } from '@talxis/base-controls'
import { PcfContextProvider } from '@talxis/base-controls/utils/adapters/pcf-context/PcfContextProvider'
import { createScratchProvider, NAME_COL, STACK_RANK_COL, STATUS_COL } from './scratchCheckListData'

const FIELD_MAPPING: ICheckListFieldMapping = {
    name: NAME_COL,
    stackRank: STACK_RANK_COL,
    status: STATUS_COL,
}

/**
 * The scratch harness for the `CheckList` control: one in-memory provider, the field mapping, nothing
 * else. Edit this file to try things against the control.
 */
export const ScratchCheckList = () => {
    const provider = React.useMemo(() => createScratchProvider(), [])

    return (
        <PcfContextProvider>
            <CheckList
                provider={provider}
                fieldMapping={FIELD_MAPPING}
                height="600px"
            />
        </PcfContextProvider>
    )
}
