import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const DEAL_SUMMARY_CODE = `import { IRuntime, RuntimeHost, RuntimeLifecycle, useRuntime } from '@talxis/base-controls'
import { DefaultButton, Spinner, Stack, Text, Toggle, mergeStyleSets } from '@fluentui/react'

const OPEN_DEALS = [4000, 21500, 9000]

const styles = mergeStyleSets({
    log: { margin: 0, padding: 12, fontSize: 12, minHeight: 160, background: 'color-mix(in srgb, currentColor 4%, transparent)', border: '1px solid color-mix(in srgb, currentColor 15%, transparent)', borderRadius: 4 },
})

class DealSummaryRuntime implements IRuntime {
    //runs _init once the host asks, and keeps the status, the error and the events
    public readonly lifecycle = new RuntimeLifecycle({ onInit: () => this._init() })
    private _total = 0
    private _shouldFail: () => boolean

    constructor(shouldFail: () => boolean) {
        this._shouldFail = shouldFail
    }

    public getTotal(): number {
        return this._total
    }

    //stands in for a server call; a throw shows the error with Try again
    private async _init(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 1000))
        if (this._shouldFail()) {
            throw new Error('The deals service is not reachable.')
        }
        this._total = OPEN_DEALS.reduce((sum, value) => sum + value, 0)
    }
}

//drawn by the host on every mount; useRuntime re-renders it when the status changes
const DealSummaryMount = () => {
    const runtime = useRuntime<DealSummaryRuntime>()
    if (runtime.lifecycle.getStatus() === 'initializing') {
        return <Spinner label='Loading the open deals...' />
    }
    return <Stack horizontal tokens={{ childrenGap: 12 }} verticalAlign='center'>
        <Text variant='large'>Open deals: {runtime.getTotal().toLocaleString()} USD</Text>
        <DefaultButton text='Reload' onClick={() => runtime.lifecycle.remount()} />
    </Stack>
}

const GridExample = () => {
    const shouldFail = React.useRef(false)
    const [entries, setEntries] = React.useState<string[]>([])
    const log = (entry: string) => setEntries(current => [...current, entry])

    //a new runtime for every mount, so subscribe here
    const onMounted = (runtime: DealSummaryRuntime) => {
        log('onMounted')
        runtime.lifecycle.events.addEventListener('onReady', () => log('onReady'))
        runtime.lifecycle.events.addEventListener('onInitFailed', error => log(\`onInitFailed: \${(error as Error).message}\`))
        runtime.lifecycle.events.addEventListener('onDestroyed', () => log('onDestroyed'))
    }

    return <Stack tokens={{ childrenGap: 16 }}>
        <Toggle label='Fail the next load' inlineLabel onChange={(_, checked) => shouldFail.current = !!checked} />
        <RuntimeHost onCreate={() => new DealSummaryRuntime(() => shouldFail.current)} onMounted={onMounted}>
            <DealSummaryMount />
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

    //kept in the store, then a new mount loads that owner's deals
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

const DealSummaryMount = () => {
    const runtime = useRuntime<DealSummaryRuntime>()
    if (runtime.lifecycle.getStatus() === 'initializing') {
        return <Spinner label={\`Loading the deals of \${runtime.getOwner()}...\`} />
    }
    return <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign='end'>
        <Dropdown label='Account manager' selectedKey={runtime.getOwner()} options={OWNERS.map(owner => ({ key: owner, text: owner }))} onChange={(_, option) => runtime.setOwner(String(option!.key))} styles={{ root: { width: 200 } }} />
        <Text variant='large'>Open deals: {runtime.getTotal().toLocaleString()} USD</Text>
    </Stack>
}

const GridExample = () => {
    //outlives every runtime, so the next mount opens on the owner this one stored
    const store = useControlStateStore('dealSummary')
    return <RuntimeHost onCreate={() => new DealSummaryRuntime(store)}>
        <DealSummaryMount />
    </RuntimeHost>
}
`

export const DealSummaryExample = () => <GridExampleRunner seedCode={DEAL_SUMMARY_CODE} tabs={['preview', 'code']} />

export const KeepStateExample = () => <GridExampleRunner seedCode={KEEP_STATE_CODE} tabs={['preview', 'code']} />
