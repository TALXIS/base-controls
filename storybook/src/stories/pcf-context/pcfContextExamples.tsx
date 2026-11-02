import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const FORMAT_CODE = `const CULTURES = [
    { key: 'en-US', text: 'English (United States)', lcid: 1033 },
    { key: 'cs-CZ', text: 'Čeština', lcid: 1029 },
    { key: 'de-DE', text: 'Deutsch', lcid: 1031 },
    { key: 'ja-JP', text: '日本語', lcid: 1041 },
]

const Invoice = () => {
    const { formatting, userSettings } = usePcfContext()
    const issued = new Date(2026, 2, 15, 14, 30)
    return <Stack tokens={{ childrenGap: 4 }}>
        <Text>Language: {userSettings.languageId}</Text>
        <Text>Issued: {formatting.formatDateShort(issued, true)}</Text>
        <Text>Due: {formatting.formatDateLong(issued)}</Text>
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
        <PcfContextProvider userSettings={{ lcid: culture.lcid, formatInfoCultureName: culture.key }}>
            <Invoice />
        </PcfContextProvider>
    </Stack>
}
`

const DIALOGS_CODE = `const ArchiveButton = () => {
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

export const FormatExample = () => <GridExampleRunner seedCode={FORMAT_CODE} />
export const DialogsExample = () => <GridExampleRunner seedCode={DIALOGS_CODE} />
