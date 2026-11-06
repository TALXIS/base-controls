import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'

const FORMAT_CODE = `import { PcfContextProvider, usePcfContext } from '@talxis/base-controls'
import { Dropdown, Stack, Text } from '@fluentui/react'

//the culture formats dates, numbers and money
const CULTURES = [
    { key: 'en-US', text: 'English (United States)', lcid: 1033 },
    { key: 'cs-CZ', text: 'Čeština', lcid: 1029 },
    { key: 'de-DE', text: 'Deutsch', lcid: 1031 },
    { key: 'ja-JP', text: '日本語', lcid: 1041 },
]

export const Invoice = () => {
    const { formatting } = usePcfContext()
    const issued = dayjs('2026-03-15T14:30').toDate()
    const due = dayjs('2026-04-14').toDate()
    return <Stack tokens={{ childrenGap: 4 }}>
        <Text>Issued: {formatting.formatDateShort(issued, true)}</Text>
        <Text>Due: {formatting.formatDateLong(due)}</Text>
        <Text>Total: {formatting.formatCurrency(12480.5, 2)}</Text>
        <Text>Hours: {formatting.formatDecimal(1234.75, 2)}</Text>
        <Text>Time spent: {formatting.formatDuration(150)}</Text>
    </Stack>
}

const GridExample = () => {
    const [cultureKey, setCultureKey] = React.useState('cs-CZ')
    const culture = CULTURES.find(candidate => candidate.key === cultureKey)!
    return <Stack tokens={{ childrenGap: 12 }}>
        <Dropdown label='Culture' options={CULTURES} selectedKey={cultureKey} onChange={(_, option) => setCultureKey(String(option?.key))} styles={{ root: { maxWidth: 280 } }} />
        {/* outside a PCF, the provider builds the context from these settings */}
        <PcfContextProvider userSettings={{ lcid: culture.lcid, formatInfoCultureName: culture.key }}>
            <Invoice />
        </PcfContextProvider>
    </Stack>
}
`

const DIALOGS_CODE = `import { PcfContextProvider, usePcfContext } from '@talxis/base-controls'
import { PrimaryButton, Stack, Text } from '@fluentui/react'

const ArchiveButton = () => {
    //the host's dialogs, or the browser's own outside a host
    const { navigation } = usePcfContext()
    const [result, setResult] = React.useState('')

    const archive = async () => {
        const { confirmed } = await navigation.openConfirmDialog({ title: 'Archive', text: 'Archive the selected deals?' })
        if (!confirmed) {
            setResult('Kept as they are.')
            return
        }
        await navigation.openAlertDialog({ text: 'The deals were archived.' })
        setResult('Archived.')
    }

    return <Stack horizontal verticalAlign='center' tokens={{ childrenGap: 12 }}>
        <PrimaryButton text='Archive' onClick={() => { archive() }} />
        <Text>{result}</Text>
    </Stack>
}

const GridExample = () => <PcfContextProvider>
    <ArchiveButton />
</PcfContextProvider>
`

const PCF_CONTROL_FILE: IGridExampleFile = {
    name: 'index.tsx',
    code: `//a PCF control hands the provider the host's context
import ReactDOM from 'react-dom'
import { PcfContextProvider } from '@talxis/base-controls'
import { Invoice } from './GridExample'

export class InvoiceControl implements ComponentFramework.StandardControl<{}, {}> {
    private _container!: HTMLDivElement

    public init(context: ComponentFramework.Context<{}>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {
        this._container = container
    }

    public updateView(context: ComponentFramework.Context<{}>) {
        ReactDOM.render(<PcfContextProvider context={context}>
            <Invoice />
        </PcfContextProvider>, this._container)
    }

    public destroy() {
        ReactDOM.unmountComponentAtNode(this._container)
    }
}
`,
}

export const FormatExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: FORMAT_CODE }, PCF_CONTROL_FILE]} tabs={['preview', 'code']} />
export const DialogsExample = () => <GridExampleRunner seedCode={DIALOGS_CODE} tabs={['preview', 'code']} />
