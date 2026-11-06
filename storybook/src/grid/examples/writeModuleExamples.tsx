import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'
import type { IGridExampleFile } from '../GridLivePreview'

export const UNSAVED_CHANGES_BAR_CODE = `import type { IUnsavedChanges } from './types'

const describeChanges = (count: number) => count === 1 ? '1 product has unsaved changes.' : \`\${count} products have unsaved changes.\`

const UnsavedChangesBar = () => {
    //registered by the module that draws this bar
    const unsavedChanges = useGridModule('unsavedChanges')
    const provider = useGridService('provider')
    const [count, setCount] = React.useState(unsavedChanges.getCount)

    React.useEffect(() => unsavedChanges.subscribe(setCount), [])

    if (count === 0) {
        return null
    }
    return <MessageBar
        messageBarType={MessageBarType.warning}
        isMultiline={false}
        actions={<Stack horizontal tokens={{ childrenGap: 8 }}>
            <PrimaryButton text='Save all' onClick={() => { provider.save() }} />
            <DefaultButton text='Discard' onClick={() => provider.clearChanges()} />
        </Stack>}>
        {describeChanges(count)}
    </MessageBar>
}

const unsavedChangesModule: IGridModule = {
    name: 'unsavedChanges',
    onLoad: grid => {
        const provider = grid.services.get('provider')
        const listeners = new Set<(count: number) => void>()
        const getCount = () => provider.getDirtyRecordIds().length
        const notify = () => listeners.forEach(listener => listener(getCount()))
        const unsavedChanges: IUnsavedChanges = {
            getCount,
            subscribe: listener => {
                listeners.add(listener)
                return () => listeners.delete(listener)
            },
        }
        grid.services.get('surfaces').hooks.surfaces.add(surfaces => {
            surfaces.push({ key: 'unsavedChanges', onRender: () => <UnsavedChangesBar /> })
        })

        //the provider outlives the grid
        grid.services.observe('gridApi', () => {
            const unsubscribes = [
                provider.addEventListener('onRecordColumnValueChanged', notify),
                provider.addEventListener('onAfterRecordSaved', notify),
                provider.addEventListener('onNewDataLoaded', notify),
            ]
            return () => unsubscribes.forEach(unsubscribe => unsubscribe())
        })
        return unsavedChanges
    },
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <Grid
            modules={[createClientSideRowModelModule(), createEditingModule(), unsavedChangesModule]}
            maxVisibleRows={9} />
    </DatasetControl.Body>
</DatasetControl>
`

const UNSAVED_CHANGES_TYPES_FILE: IGridExampleFile = {
    name: 'types.ts',
    code: `//types the unsavedChanges instance wherever it is reached
export interface IUnsavedChanges {
    getCount(): number
    subscribe(listener: (count: number) => void): () => void
}

declare module '@talxis/base-controls' {
    interface IGridModuleMap {
        unsavedChanges: IUnsavedChanges
    }
}
`,
}

export const UnsavedChangesBarExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: UNSAVED_CHANGES_BAR_CODE }, UNSAVED_CHANGES_TYPES_FILE]} dataset='products' />
