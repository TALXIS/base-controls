import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const DEAL_SUMMARY_CODE = `import { IRuntime, RuntimeHost, RuntimeLifecycle, useRuntime } from '@talxis/base-controls'
import { DefaultButton, Stack, Text, Toggle, mergeStyleSets } from '@fluentui/react'

const OPEN_DEALS = [4000, 21500, 9000]

const styles = mergeStyleSets({
    log: { margin: 0, padding: 12, fontSize: 12, minHeight: 160, background: 'color-mix(in srgb, currentColor 4%, transparent)', border: '1px solid color-mix(in srgb, currentColor 15%, transparent)', borderRadius: 4 },
})

//stands in for a server call
const callServer = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

class DealSummaryRuntime implements IRuntime {
    //runs onInit when the host starts the mount, and keeps the status, the error and the events
    public readonly lifecycle = new RuntimeLifecycle({ onInit: () => this._init() })
    private _total = 0
    private _isServiceDown: () => boolean

    constructor(isServiceDown: () => boolean) {
        this._isServiceDown = isServiceDown
    }

    public getTotal(): number {
        return this._total
    }

    //a throw here shows the error with Try again
    private async _init(): Promise<void> {
        await callServer(1000)
        if (this._isServiceDown()) {
            throw new Error('The deals service is not reachable.')
        }
        this._total = OPEN_DEALS.reduce((sum, value) => sum + value, 0)
    }
}

//drawn once the runtime is ready, so it reads what the runtime loaded
const DealSummary = () => {
    const runtime = useRuntime<DealSummaryRuntime>()
    return <Stack horizontal tokens={{ childrenGap: 12 }} verticalAlign='center'>
        <Text variant='large'>Open deals: {runtime.getTotal().toLocaleString()} USD</Text>
        {/* a new runtime, which loads again */}
        <DefaultButton text='Reload' onClick={() => runtime.lifecycle.remount()} />
    </Stack>
}

const GridExample = () => {
    const isServiceDown = React.useRef(false)
    const [entries, setEntries] = React.useState<string[]>([])
    const log = (entry: string) => setEntries(current => [...current, entry])

    //called with every new runtime, so subscribe here
    const onSetup = (runtime: DealSummaryRuntime) => {
        log('onSetup')
        runtime.lifecycle.events.addEventListener('onReady', () => log('onReady'))
        runtime.lifecycle.events.addEventListener('onInitFailed', error => log(\`onInitFailed: \${(error as Error).message}\`))
        runtime.lifecycle.events.addEventListener('onDestroyed', () => log('onDestroyed'))
    }

    return <Stack tokens={{ childrenGap: 16 }}>
        <Toggle label='Service unavailable' inlineLabel onChange={(_, checked) => { isServiceDown.current = !!checked }} />
        <RuntimeHost onCreate={() => new DealSummaryRuntime(() => isServiceDown.current)} onSetup={onSetup}>
            <DealSummary />
        </RuntimeHost>
        <pre className={styles.log}>{entries.join('\\n')}</pre>
    </Stack>
}
`

const KEEP_STATE_CODE = `import { IRuntime, IStateStore, RuntimeHost, RuntimeLifecycle, useControlStateStore, useRuntime } from '@talxis/base-controls'
import { Dropdown, Spinner, Stack, Text } from '@fluentui/react'

const DEALS = [
    { owner: 'Anna Novak', value: 4000 },
    { owner: 'Ben Carter', value: 21500 },
    { owner: 'Anna Novak', value: 9000 },
]

const OWNERS = ['Everyone', 'Anna Novak', 'Ben Carter']

class DealSummaryRuntime implements IRuntime {
    public readonly lifecycle = new RuntimeLifecycle({ onInit: () => this._init() })
    private _store: IStateStore
    private _total = 0

    constructor(store: IStateStore) {
        this._store = store
    }

    public getOwner(): string {
        return this._store.get<string>('owner') ?? 'Everyone'
    }

    //kept in the store, then a new runtime loads that owner's deals
    public setOwner(owner: string): void {
        this._store.set('owner', owner)
        this.lifecycle.remount()
    }

    public getTotal(): number {
        return this._total
    }

    private async _init(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 800))
        const owner = this.getOwner()
        this._total = DEALS.filter(deal => owner === 'Everyone' || deal.owner === owner).reduce((sum, deal) => sum + deal.value, 0)
    }
}

//shown while the runtime loads; it can read the runtime too
const LoadingDeals = () => {
    const runtime = useRuntime<DealSummaryRuntime>()
    return <Spinner label={\`Loading the deals of \${runtime.getOwner()}...\`} />
}

//drawn once the runtime is ready, so it reads what the runtime loaded
const DealSummary = () => {
    const runtime = useRuntime<DealSummaryRuntime>()
    return <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign='end'>
        <Dropdown label='Account manager' selectedKey={runtime.getOwner()} options={OWNERS.map(owner => ({ key: owner, text: owner }))} onChange={(_, option) => runtime.setOwner(String(option!.key))} styles={{ root: { width: 200 } }} />
        <Text variant='large'>Open deals: {runtime.getTotal().toLocaleString()} USD</Text>
    </Stack>
}

const GridExample = () => {
    //outlives every runtime, so the next mount opens on the owner this one stored
    const store = useControlStateStore('dealSummary')
    return <RuntimeHost onCreate={() => new DealSummaryRuntime(store)} components={{ loading: { onRenderContainer: () => <LoadingDeals /> } }}>
        <DealSummary />
    </RuntimeHost>
}
`

export const DealSummaryExample = () => <GridExampleRunner seedCode={DEAL_SUMMARY_CODE} tabs={['preview', 'code']} />

export const KeepStateExample = () => <GridExampleRunner seedCode={KEEP_STATE_CODE} tabs={['preview', 'code']} />
