import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const APPLICATION_CODE = `import { AppThemeProvider, createClientSideRowModelModule, DatasetControl, Form, Grid, Panel, PcfContextProvider, StateProvider, useThemeBuilder } from '@talxis/base-controls'

const BRANDS = [
    { key: 'light', text: 'Light', colors: { primary: '#5B5FC7', background: '#ffffff', text: '#242424' } },
    { key: 'dark', text: 'Dark', colors: { primary: '#7f85f5', background: '#292929', text: '#ffffff' } },
    { key: 'ocean', text: 'Ocean', colors: { primary: '#0f7b8a', background: '#f4fafb', text: '#12313a' } },
    { key: 'rose', text: 'Rose', colors: { primary: '#c2185b', background: '#fff7fa', text: '#3a1424' } },
    { key: 'midnight', text: 'Midnight', colors: { primary: '#4cc2ff', background: '#0f1b2d', text: '#e6edf7' } },
]

//the Base Controls form edits the grid's own record of the opened deal
const DealForm = (props: { deal: IRecord }) => {
    return <Form.Root key={props.deal.getRecordId()} onLoad={async () => ({ record: props.deal })}>
        <Form.Section label='Deal' layout={{ lg: 1 }} cellLabelPosition='Top'>
            {['name', 'owner', 'stage', 'value', 'probability', 'closedate'].map(name => <Form.Field key={name} name={name}>
                <Form.Cell>
                    <Form.Control />
                </Form.Cell>
            </Form.Field>)}
        </Form.Section>
    </Form.Root>
}

const GridExample = () => {
    const [brand, setBrand] = React.useState(BRANDS[0])
    const theme = useThemeBuilder({ colors: brand.colors })
    const deals = React.useMemo(() => {
        const provider = createDealsProvider()
        //the primary column draws each deal's name as a link that opens it
        provider.setColumns(provider.getColumns().map(column => column.name === 'name' ? { ...column, isPrimary: true } : column))
        return provider
    }, [])
    const [openedDeal, setOpenedDeal] = React.useState<IRecord>()

    //the root: one host, one place for state and one theme for everything below
    return <PcfContextProvider>
        <StateProvider>
            <AppThemeProvider theme={theme} style={{ padding: 12 }}>
                {/* a control reads the theme as it mounts */}
                <DatasetControl key={theme.id} onLoad={async () => ({ provider: deals })} height='400px'>
                    <DatasetControl.Header>
                        <DatasetControl.Header.Start>
                            <Dropdown ariaLabel='Theme' options={BRANDS} selectedKey={brand.key} onChange={(_, option) => setBrand(BRANDS.find(other => other.key === option?.key)!)} styles={{ root: { width: 140 } }} />
                        </DatasetControl.Header.Start>
                        <DatasetControl.Header.End>
                            <DatasetControl.QuickFind />
                        </DatasetControl.Header.End>
                    </DatasetControl.Header>
                    <DatasetControl.Body>
                        {/* click a deal's name to open it */}
                        <Grid
                            modules={[createClientSideRowModelModule()]}
                            enableNavigation
                            onOpenRecord={({ record }) => setOpenedDeal(record)} />
                    </DatasetControl.Body>
                </DatasetControl>
                {/* drawn in the same theme as the grid */}
                <Panel isOpen={!!openedDeal} isLightDismiss headerText={openedDeal?.getFormattedValue('name') ?? ''} onDismiss={() => setOpenedDeal(undefined)}>
                    {openedDeal && <DealForm deal={openedDeal} />}
                </Panel>
            </AppThemeProvider>
        </StateProvider>
    </PcfContextProvider>
}
`

const CUSTOM_FIELD_CODE = `import { createMemoryRecord, Form, useField } from '@talxis/base-controls'

const record = createMemoryRecord({
    columns: createDealsProvider().getColumns(),
    data: { docs_dealid: 'fabrikam', name: 'Fabrikam: Support renewal', owner: 'Ben Carter', value: 21500, probability: 55 },
    metadata: { PrimaryIdAttribute: 'docs_dealid', PrimaryNameAttribute: 'name' },
})

//a control of your own: reads and writes the field it sits in
const WinChanceSlider = () => {
    const field = useField()!
    return <Slider min={0} max={100} step={5} value={Number(field.getValue() ?? 0)} valueFormat={value => \`\${value}%\`} onChange={value => field.setValue(value)} />
}

//the form's own parts, with one field drawn by your control
const GridExample = () => <Form.Root onLoad={async () => ({ record })}>
    {/* saves the form, and says when it has unsaved changes */}
    <Form.Ribbon />
    <Form.Notifications />
    <Form.Section label='Deal' layout={{ lg: 1 }} cellLabelPosition='Top'>
        <Form.Field name='name'>
            <Form.Cell>
                <Form.Control />
            </Form.Cell>
        </Form.Field>
        <Form.Field name='value'>
            <Form.Cell>
                <Form.Control />
            </Form.Cell>
        </Form.Field>
        <Form.Field name='probability'>
            <Form.Cell label='Win chance'>
                <Form.Control components={{ onRenderControl: () => <WinChanceSlider /> }} />
            </Form.Cell>
        </Form.Field>
    </Form.Section>
</Form.Root>
`

const PURE_UI_CODE = `import { BaseControls, DatasetControl, FormUi, NestedControlRenderer, usePcfContext } from '@talxis/base-controls'

//the deals' columns: the stage is an option set, the value a currency
const DEAL_FIELDS = createDealsProvider().getColumns()
const SEARCHED_COLUMNS = DEAL_FIELDS.filter(column => column.name === 'name')
const PAGE_SIZE = 3

interface IDeal {
    id: string
    name: string
    stage: number
    value: number
}

const VIEWS = [
    { key: 'all', text: 'All deals', matches: (deal: IDeal) => true },
    { key: 'won', text: 'Won deals', matches: (deal: IDeal) => deal.stage === 4 },
]

//plain data in your own state: no provider, no runtime
const DEALS: IDeal[] = [
    { id: 'contoso', name: 'Contoso: CRM rollout', stage: 1, value: 4000 },
    { id: 'fabrikam', name: 'Fabrikam: Support renewal', stage: 2, value: 21500 },
    { id: 'northwind', name: 'Northwind: Data migration', stage: 3, value: 9000 },
    { id: 'adventure', name: 'Adventure Works: Licences', stage: 4, value: 26500 },
    { id: 'litware', name: 'Litware: Onboarding', stage: 1, value: 14000 },
]

//the Base Controls field for a column's data type
const ColumnControl = (props: { column: IColumn, value: unknown, onChange: (value: unknown) => void }) => {
    const context = usePcfContext()
    return <NestedControlRenderer
        context={context}
        parameters={{
            ControlName: BaseControls.GetControlNameForDataType(props.column.dataType),
            Bindings: { value: { type: props.column.dataType, value: props.value, isStatic: false, metadata: { onOverrideMetadata: () => props.column.metadata } } },
        }}
        onNotifyOutputChanged={outputs => props.onChange(outputs.value)} />
}

//the form's section and cells as plain UI, each cell drawing its column's field
const DealCard = (props: { deal: IDeal, onChange: (deal: IDeal) => void }) => <FormUi.Section label={props.deal.name} layout={{ lg: 2 }} cellLabelPosition='Top'>
    {(['stage', 'value'] as const).map(name => {
        const column = DEAL_FIELDS.find(other => other.name === name)!
        return <FormUi.Cell key={name} label={column.displayName}>
            <ColumnControl column={column} value={props.deal[name]} onChange={value => props.onChange({ ...props.deal, [name]: value })} />
        </FormUi.Cell>
    })}
</FormUi.Section>

const GridExample = () => {
    const [deals, setDeals] = React.useState(DEALS)
    const [view, setView] = React.useState(VIEWS[0])
    const [query, setQuery] = React.useState('')
    const [page, setPage] = React.useState(0)

    const shown = deals.filter(view.matches).filter(deal => deal.name.toLowerCase().startsWith(query.toLowerCase()))
    const pageDeals = shown.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    const find = (value: string) => { setQuery(value); setPage(0) }

    //the DatasetControl's frame and parts, each drawn as plain UI from your own state
    return <DatasetControl.Ui.Container height='420px'>
        <DatasetControl.Ui.Header>
            <DatasetControl.Ui.HeaderStart>
                <DatasetControl.Ui.ViewSwitcher
                    text={view.text}
                    selectedKey={view.key}
                    items={VIEWS.map(option => ({ key: option.key, text: option.text, onClick: () => { setView(option); setPage(0) } }))} />
            </DatasetControl.Ui.HeaderStart>
            <DatasetControl.Ui.HeaderEnd>
                <DatasetControl.Ui.QuickFind
                    value={query}
                    placeholder='Search deals...'
                    columns={SEARCHED_COLUMNS}
                    isLikeQuery={false}
                    labels={{ leadingWildcardWarning: 'Do not start with an asterisk (*)', columnsHintStart: 'Apply', columnsHintOperator: 'begins with', columnsHintEnd: 'filter on these columns:' }}
                    onChange={find}
                    onSearch={() => find(query)}
                    onClear={() => find('')} />
            </DatasetControl.Ui.HeaderEnd>
        </DatasetControl.Ui.Header>
        <DatasetControl.Ui.Body>
            <FormUi.Tab id='board' layout={{ lg: 3, md: 3, sm: 2, xs: 1 }}>
                {pageDeals.map(deal => <FormUi.Column key={deal.id}>
                    <DealCard deal={deal} onChange={changed => setDeals(deals.map(other => other.id === changed.id ? changed : other))} />
                </FormUi.Column>)}
            </FormUi.Tab>
        </DatasetControl.Ui.Body>
        <DatasetControl.Ui.Footer>
            <DatasetControl.Ui.FooterEnd>
                <DatasetControl.Ui.Pagination
                    canMovePrevious={page > 0}
                    canMoveNext={(page + 1) * PAGE_SIZE < shown.length}
                    labels={{ firstPageTooltip: 'First page', previousPageTooltip: 'Previous page', nextPageTooltip: 'Next page', currentPage: \`Page \${page + 1}\` }}
                    onMoveFirst={() => setPage(0)}
                    onMovePrevious={() => setPage(page - 1)}
                    onMoveNext={() => setPage(page + 1)} />
            </DatasetControl.Ui.FooterEnd>
        </DatasetControl.Ui.Footer>
    </DatasetControl.Ui.Container>
}
`

export const ApplicationExample = () => <GridExampleRunner seedCode={APPLICATION_CODE} />
export const CustomFieldExample = () => <GridExampleRunner seedCode={CUSTOM_FIELD_CODE} tabs={['preview', 'code']} />
export const PureUiExample = () => <GridExampleRunner seedCode={PURE_UI_CODE} tabs={['preview', 'code']} />
