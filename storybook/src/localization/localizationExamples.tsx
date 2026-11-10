import React from 'react'
import { GridExampleRunner } from '../grid/GridExampleRunner'

const SWITCH_LANGUAGE_CODE = `import { ClientSideGrid, createSortingModule, CZECH_LABELS, DatasetControl, LabelsProvider, PcfContextProvider, usePcfContext } from '@talxis/base-controls'
import { DataTypes, IFormatting, MemoryDataProvider } from '@talxis/client-libraries'
import { ChoiceGroup, Stack } from '@fluentui/react'

//the culture formats dates and numbers, the labels translate the strings
const LANGUAGES = [
    { key: 'en', text: 'English', lcid: 1033, culture: 'en-US', labels: {}, columnNames: ['Deal', 'Value', 'Close date'] },
    { key: 'cs', text: 'Čeština', lcid: 1029, culture: 'cs-CZ', labels: CZECH_LABELS, columnNames: ['Obchod', 'Hodnota', 'Uzavření'] },
    {
        key: 'own', text: 'Your own wording', lcid: 1033, culture: 'en-US', columnNames: ['Deal', 'Value', 'Close date'],
        //only the keys you change; the rest stay English
        labels: {
            'quickFind.searchPlaceholder': 'Find a deal...',
            'gridSorting.sortNumberAscending': 'Smallest first',
            'gridSorting.sortNumberDescending': 'Biggest first',
            'pageSizeSwitcher.recordTotal': 'out of {{ total }}',
        },
    },
]

//column names are data, not labels: they come with the columns
const createDeals = (columnNames: string[], formatting: IFormatting) => new MemoryDataProvider({
    dataSource: [
        { dealid: 'contoso', name: 'Contoso: CRM rollout', value: 4000, closedate: '2026-03-15' },
        { dealid: 'fabrikam', name: 'Fabrikam: Support renewal', value: 21500, closedate: '2026-04-02' },
        { dealid: 'litware', name: 'Litware: Onboarding', value: 14000, closedate: '2026-06-30' },
    ],
    metadata: { PrimaryIdAttribute: 'dealid', PrimaryNameAttribute: 'name', LogicalName: 'deal' },
    columns: [
        { name: 'name', displayName: columnNames[0], dataType: DataTypes.SingleLineText, isPrimary: true },
        { name: 'value', displayName: columnNames[1], dataType: DataTypes.Currency },
        { name: 'closedate', displayName: columnNames[2], dataType: DataTypes.DateAndTimeDateOnly },
    ],
    //the values follow the culture of the PCF context
    formatting,
})

const Deals = (props: { columnNames: string[] }) => {
    const { formatting } = usePcfContext()
    return <DatasetControl onLoad={async () => ({ provider: createDeals(props.columnNames, formatting) })} height='300px'>
        <DatasetControl.Header>
            <DatasetControl.Header.End>
                <DatasetControl.QuickFind />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <ClientSideGrid modules={[createSortingModule()]} />
        </DatasetControl.Body>
        <DatasetControl.Footer>
            <DatasetControl.Footer.Start>
                <DatasetControl.PageSizeSwitcher />
            </DatasetControl.Footer.Start>
        </DatasetControl.Footer>
    </DatasetControl>
}

const GridExample = () => {
    const [language, setLanguage] = React.useState(LANGUAGES[0])
    return <Stack tokens={{ childrenGap: 12 }}>
        <ChoiceGroup selectedKey={language.key} options={LANGUAGES} onChange={(_, option) => setLanguage(LANGUAGES.find(other => other.key === option?.key)!)} />
        <PcfContextProvider userSettings={{ lcid: language.lcid, formatInfoCultureName: language.culture }}>
            <LabelsProvider labels={language.labels}>
                {/* remounted, so the grid builds again with the new labels and culture */}
                <Deals key={language.key} columnNames={language.columnNames} />
            </LabelsProvider>
        </PcfContextProvider>
    </Stack>
}
`

const OWN_LABELS_CODE = `import { LabelsProvider, useLabels } from '@talxis/base-controls'
import { Stack, Text, Toggle } from '@fluentui/react'
import { INVOICE_LABELS } from './labels/en'
import { INVOICE_LABELS_CS } from './labels/cs'

const LINES = ['Standing desk', 'Ergonomic chair', 'Desk lamp']

const Invoice = (props: { lines: string[] }) => {
    //the nearest LabelsProvider's strings, or the English defaults
    const labels = useLabels(INVOICE_LABELS)
    return <Stack tokens={{ childrenGap: 4 }}>
        <Text variant='large'>{labels.get('invoice.title')}</Text>
        <Text>{labels.get('invoice.lineCount', { count: props.lines.length })}</Text>
    </Stack>
}

const GridExample = () => {
    const [isCzech, setIsCzech] = React.useState(true)
    return <Stack tokens={{ childrenGap: 12 }}>
        <Toggle label='Czech' inlineLabel checked={isCzech} onChange={(_, checked) => setIsCzech(!!checked)} />
        <LabelsProvider labels={isCzech ? INVOICE_LABELS_CS : {}}>
            <Invoice lines={LINES} />
        </LabelsProvider>
    </Stack>
}
`

const LABELS_FILE = {
    name: 'labels/en.ts',
    code: `import { defineLabels } from '@talxis/base-controls'

//every key prefixed with the component's name
export const INVOICE_LABELS = defineLabels({
    'invoice.title': 'Invoice',
    'invoice.lineCount': 'Lines: {{ count }}',
})
`,
}

const CZECH_FILE = {
    name: 'labels/cs.ts',
    code: `import { translateLabels } from '@talxis/base-controls'
import { INVOICE_LABELS } from './en'

//keys checked against the set
export const INVOICE_LABELS_CS = translateLabels(INVOICE_LABELS, {
    'invoice.title': 'Faktura',
    'invoice.lineCount': 'Řádky: {{ count }}',
})
`,
}

export const SwitchLanguageExample = () => <GridExampleRunner seedCode={SWITCH_LANGUAGE_CODE} tabs={['preview', 'code']} />

export const OwnLabelsExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: OWN_LABELS_CODE }, LABELS_FILE, CZECH_FILE]} tabs={['preview', 'code']} />
