import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const UNSAVED_CHANGES_BAR_CODE = `interface IUnsavedChanges {
    getCount(): number
    subscribe(listener: (count: number) => void): () => void
}

//in your project: declare module '@talxis/base-controls'
declare global {
    interface IGridModuleServiceMap {
        unsavedChanges: IUnsavedChanges
    }
}

const describeChanges = (count: number) => count === 1 ? '1 product has unsaved changes.' : \`\${count} products have unsaved changes.\`

const UnsavedChangesBar = () => {
    //registered by the module that draws this bar
    const unsavedChanges = useGridService('unsavedChanges')!
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
    onRegister: runtime => {
        const provider = runtime.services.get('provider')
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
        runtime.services.register('unsavedChanges', () => unsavedChanges)
        runtime.services.get('surfaces').registerSurface(surfaces => {
            surfaces.push({ key: 'unsavedChanges', onRender: () => <UnsavedChangesBar /> })
        })

        provider.addEventListener('onRecordColumnValueChanged', notify)
        provider.addEventListener('onAfterRecordSaved', notify)
        provider.addEventListener('onNewDataLoaded', notify)
        //the provider outlives the grid
        runtime.events.addEventListener('onDestroyed', () => {
            provider.removeEventListener('onRecordColumnValueChanged', notify)
            provider.removeEventListener('onAfterRecordSaved', notify)
            provider.removeEventListener('onNewDataLoaded', notify)
        })
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule(), custom: [unsavedChangesModule] }}
    maxVisibleRows={9} />
`

export const UnsavedChangesBarExample = () => <GridExampleRunner seedCode={UNSAVED_CHANGES_BAR_CODE} dataset='products' />
