import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const APPLICATION_CODE = `import { AppThemeProvider, ClientSideGrid, DatasetControl, Form, IGrid, Panel, PcfContextProvider, useThemeBuilder } from '@talxis/base-controls'
import { IRecord } from '@talxis/client-libraries'
import { Toggle } from '@fluentui/react'

const LIGHT = { primary: '#5B5FC7', background: '#ffffff', text: '#242424' }
const DARK = { primary: '#7f85f5', background: '#292929', text: '#ffffff' }

const loadDeals = async () => {
    const provider = createDealsProvider()
    //the primary column draws each deal's name as a link that opens it
    provider.setColumns(provider.getColumns().map(column => column.name === 'name' ? { ...column, isPrimary: true } : column))
    return { provider }
}

//the Base Controls form edits the grid's own record of the opened deal
const DealForm = (props: { deal: IRecord }) => <Form.Root key={props.deal.getRecordId()} onLoad={async () => ({ record: props.deal })}>
    <Form.Section label='Deal' layout={{ lg: 1 }} cellLabelPosition='Top'>
        {['name', 'stage', 'value', 'closedate'].map(name => <Form.Field key={name} name={name}>
            <Form.Cell>
                <Form.Control />
            </Form.Cell>
        </Form.Field>)}
    </Form.Section>
</Form.Root>

const GridExample = () => {
    const [isDark, setIsDark] = React.useState(false)
    const theme = useThemeBuilder({ colors: isDark ? DARK : LIGHT })
    const [openedDeal, setOpenedDeal] = React.useState<IRecord>()

    const onSetup = (grid: IGrid) => {
        grid.hooks.openRecord.add(request => {
            //a handled request is not passed on to the provider
            request.isHandled = true
            setOpenedDeal(request.record)
        })
    }

    //the root: one host and one theme for everything below
    return <PcfContextProvider>
        <AppThemeProvider theme={theme}>
            {/* a control reads the theme as it mounts */}
            <DatasetControl key={theme.id} onLoad={loadDeals} height='400px'>
                <DatasetControl.Header>
                    <DatasetControl.Header.Start>
                        {/* a part of your own beside the built-in ones */}
                        <Toggle label='Dark theme' inlineLabel checked={isDark} onChange={(_, checked) => setIsDark(!!checked)} />
                    </DatasetControl.Header.Start>
                    <DatasetControl.Header.End>
                        <DatasetControl.QuickFind />
                    </DatasetControl.Header.End>
                </DatasetControl.Header>
                <DatasetControl.Body>
                    <ClientSideGrid onSetup={onSetup} />
                </DatasetControl.Body>
            </DatasetControl>
            {/* drawn in the same theme as the grid */}
            <Panel isOpen={!!openedDeal} isLightDismiss headerText={openedDeal?.getFormattedValue('name') ?? ''} onDismiss={() => setOpenedDeal(undefined)}>
                {openedDeal && <DealForm deal={openedDeal} />}
            </Panel>
        </AppThemeProvider>
    </PcfContextProvider>
}
`

const PURE_UI_CODE = `import { DatasetControl, FormUi } from '@talxis/base-controls'
import { Dropdown, Text } from '@fluentui/react'

const STAGES = [
    { key: 1, text: 'Qualify' },
    { key: 2, text: 'Propose' },
    { key: 3, text: 'Won' },
]

interface IDeal {
    id: string
    name: string
    stage: number
    value: string
}

const VIEWS = [
    { key: 'all', text: 'All deals', matches: (deal: IDeal) => true },
    { key: 'won', text: 'Won deals', matches: (deal: IDeal) => deal.stage === 3 },
]

//plain data in your own state: no provider, no runtime
const DEALS: IDeal[] = [
    { id: 'contoso', name: 'Contoso: CRM rollout', stage: 1, value: '$4,000' },
    { id: 'fabrikam', name: 'Fabrikam: Support renewal', stage: 2, value: '$21,500' },
    { id: 'adventure', name: 'Adventure Works: Licences', stage: 3, value: '$26,500' },
]

//the form's section and cells as plain UI
const DealCard = (props: { deal: IDeal, onChange: (deal: IDeal) => void }) => <FormUi.Section label={props.deal.name} cellLabelPosition='Top'>
    <FormUi.Cell label='Stage'>
        <Dropdown options={STAGES} selectedKey={props.deal.stage} onChange={(_, option) => props.onChange({ ...props.deal, stage: Number(option!.key) })} />
    </FormUi.Cell>
    <FormUi.Cell label='Value'>
        <Text>{props.deal.value}</Text>
    </FormUi.Cell>
</FormUi.Section>

const GridExample = () => {
    const [deals, setDeals] = React.useState(DEALS)
    const [view, setView] = React.useState(VIEWS[0])

    //the DatasetControl's frame and view switcher, drawn as plain UI from your own state
    return <DatasetControl.Ui.Container>
        <DatasetControl.Ui.Header>
            <DatasetControl.Ui.HeaderStart>
                <DatasetControl.Ui.ViewSwitcher
                    text={view.text}
                    selectedKey={view.key}
                    items={VIEWS.map(option => ({ key: option.key, text: option.text, onClick: () => setView(option) }))} />
            </DatasetControl.Ui.HeaderStart>
        </DatasetControl.Ui.Header>
        <DatasetControl.Ui.Body>
            <FormUi.Tab id='board'>
                {deals.filter(view.matches).map(deal => <FormUi.Column key={deal.id}>
                    <DealCard deal={deal} onChange={changed => setDeals(deals.map(other => other.id === changed.id ? changed : other))} />
                </FormUi.Column>)}
            </FormUi.Tab>
        </DatasetControl.Ui.Body>
    </DatasetControl.Ui.Container>
}
`

export const ApplicationExample = () => <GridExampleRunner seedCode={APPLICATION_CODE} />
export const PureUiExample = () => <GridExampleRunner seedCode={PURE_UI_CODE} tabs={['preview', 'code']} />
