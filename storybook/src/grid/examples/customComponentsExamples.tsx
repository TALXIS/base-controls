import React from 'react'
import { DataTypes } from '@talxis/client-libraries'
import { GridExampleRunner } from '../GridExampleRunner'
import type { IGridExampleFile } from '../GridLivePreview'
import { PRODUCT_COLUMNS, PRODUCT_ROWS } from '../data'
import { createMemoryProvider, metadataFor } from '../data/metadata'

export const WIN_CHANCE_CODE = `const isClosed = (deal: IRecord) => Number(deal.getValue('stage')) >= 4

const styles = mergeStyleSets({
    chance: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px' },
    ring: { flexShrink: 0, transform: 'rotate(-90deg)' },
})

const RADIUS = 9
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

//drawn again by Grid.Cell.Root whenever the deal changes
const WinChance = () => {
    const { palette } = useGridCell().getTheme().get()
    const chance = Number(useGridField()!.getValue() ?? 0)
    const filled = Math.min(Math.max(chance, 0), 100) / 100 * CIRCUMFERENCE

    return <div className={styles.chance}>
        <svg className={styles.ring} width={24} height={24} viewBox='0 0 24 24'>
            <circle cx={12} cy={12} r={RADIUS} fill='none' strokeWidth={3} stroke={palette.neutralLighter} />
            <circle cx={12} cy={12} r={RADIUS} fill='none' strokeWidth={3} stroke={palette.themePrimary} strokeDasharray={filled + ' ' + CIRCUMFERENCE} />
        </svg>
        <span>{chance}%</span>
    </div>
}

const WinChanceCell = (props: IGridCellParams) => <Grid.Cell.Field record={props.data} name={props.colDef!.colId!}>
    <Grid.Cell.Root {...props}>
        <Grid.Cell.Theme>
            <Grid.Cell.Container>
                <Grid.Cell.Loading>
                    <Grid.Cell.LockIcon />
                    <Grid.Cell.Control>
                        <WinChance />
                    </Grid.Cell.Control>
                    <Grid.Cell.Commands />
                    <Grid.Cell.FieldError />
                </Grid.Cell.Loading>
            </Grid.Cell.Container>
        </Grid.Cell.Theme>
    </Grid.Cell.Root>
</Grid.Cell.Field>

//the deals waiting on the forecasting service
const forecasting = new Set<string>()

const onSetup = (grid: IGrid) => {
    const cells = grid.services.get('cells')
    //stands in for a forecasting service
    const forecast = async (deal: IRecord) => {
        forecasting.add(deal.getRecordId())
        cells.render()
        await new Promise(resolve => window.setTimeout(resolve, 1200))
        forecasting.delete(deal.getRecordId())
        await grid.services.get('fields').get(deal, 'probability').setValue(Number(deal.getValue('stage')) * 25 - 15 + Math.round(Math.random() * 20))
        cells.render()
    }

    grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
        const probability = columnDefs.find(colDef => colDef.colId === 'probability')!
        Object.assign(probability, { headerName: 'Win chance', cellRenderer: WinChanceCell, initialWidth: 220 })
        //spread, so the column keeps the rest of what the grid set
        probability.context = { ...probability.context, alignment: 'left' }
    })
    //each hook runs for every cell
    cells.hooks.loading.add((result, { record, columnName }) => {
        if (columnName === 'probability') {
            result.isLoading = forecasting.has(record.getRecordId())
        }
    })
    cells.hooks.commands.add((result, { record, columnName }) => {
        if (columnName === 'probability' && !isClosed(record)) {
            result.items.push({ key: 'forecast', text: 'Forecast', iconOnly: true, iconProps: { iconName: 'Lightbulb' }, onClick: () => { forecast(record) } })
        }
    })
    grid.services.get('validation').hooks.validation.add((result, { record, columnName }) => {
        const chance = Number(record.getValue('probability') ?? 0)
        if (columnName === 'probability' && (chance < 0 || chance > 100)) {
            result.error = true
            result.errorMessage = 'A win chance is between 0 and 100 %.'
        }
    })
    grid.modules.observe('editing', editing => editing.locks.hooks.lock.add((result, { record, columnName }) => {
        if (record && columnName === 'probability' && isClosed(record)) {
            result.isLocked = true
        }
    }))
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createEditingModule({ enableAutoSave: true })]} onSetup={onSetup} height='440px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const HEADER_CAPTION_CODE = `const CAPTIONS: { [columnName: string]: string } = {
    price: 'USD, excl. VAT',
    instock: 'units',
    reorderlevel: 'units',
}

const styles = mergeStyleSets({
    label: { minWidth: 0 },
    caption: { opacity: 0.75 },
})

const CaptionedLabel = (props: ITextProps) => {
    const header = useGridColumnHeader()

    return <Stack className={styles.label} horizontalAlign={header.getAlignment() === 'right' ? 'end' : 'start'}>
        <Text {...props} />
        <Text variant='small' className={styles.caption}>{CAPTIONS[header.getColDef().colId!]}</Text>
    </Stack>
}

const CAPTIONED_HEADER: IColumnHeaderRendererComponents = {
    label: { onRenderText: props => <CaptionedLabel {...props} /> },
}

const onSetup = (grid: IGrid) => {
    grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
        for (const colDef of columnDefs.filter(colDef => CAPTIONS[colDef.colId!])) {
            colDef.headerComponentParams = { ...colDef.headerComponentParams, components: CAPTIONED_HEADER }
        }
    })
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <ClientSideGrid
            modules={[
                createSortingModule(),
            ]}
            onSetup={onSetup}
            height='440px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const PIPELINE_HEADER_CODE = `const styles = mergeStyleSets({
    stack: { minWidth: 0 },
    summary: { opacity: 0.7, whiteSpace: 'nowrap' },
})

//the extension the grid's total row is built on, here without drawing the row
const totals = new TotalRow(provider)
totals.addAggregation('value', 'sum')
totals.addAggregation('probability', 'avg')
totals.refresh()

const LABELS: { [aggregationFunction: string]: string } = { sum: 'Total', avg: 'Average' }

const ColumnSummary = () => {
    const aggregation = useGridColumnHeader().getColumn()?.aggregation
    const total = aggregation && totals.getTotalRowRecord()?.getFormattedValue(aggregation.alias!)
    if (!total) {
        return null
    }
    return <Text variant='small' className={styles.summary}>{LABELS[aggregation.aggregationFunction]} {total}</Text>
}

const NameAndSummary = () => {
    const header = useGridColumnHeader()
    return <Stack className={styles.stack} horizontalAlign={header.getAlignment() === 'right' ? 'end' : 'start'}>
        <Grid.ColumnHeader.Label />
        <ColumnSummary />
    </Stack>
}

const SummaryHeader = (props: IColumnHeaderRendererProps) => <Grid.ColumnHeader.Root {...props}>
    <Grid.ColumnHeader.Theme>
        <Grid.ColumnHeader.Container>
            <Grid.ColumnHeader.Prefix />
            <Grid.ColumnHeader.Content>
                <NameAndSummary />
            </Grid.ColumnHeader.Content>
            <Grid.ColumnHeader.Suffix />
        </Grid.ColumnHeader.Container>
        <Grid.ColumnHeader.Menu />
    </Grid.ColumnHeader.Theme>
</Grid.ColumnHeader.Root>

const GridExample = () => {
    const gridRef = React.useRef<IGrid>()

    //the headers redraw once the totals arrive
    React.useEffect(() => totals.getDataProvider().addEventListener('onLoading', isLoading => {
        if (!isLoading) {
            gridRef.current?.services.get('columns').headers.render()
        }
    }), [])

    const onSetup = (grid: IGrid) => {
        gridRef.current = grid
        grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
            for (const colDef of columnDefs.filter(colDef => colDef.colId === 'value' || colDef.colId === 'probability')) {
                colDef.headerComponent = SummaryHeader
            }
        })
    }

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
        <DatasetControl.Body>
            <ClientSideGrid modules={[createSortingModule()]}
                onSetup={onSetup}
                height='440px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const EMPTY_CATALOGUE_CODE = `const COMPONENTS: IGridComponents = {
    overlays: {
        emptyState: {
            onRenderIcon: props => <Icon {...props} iconName='ProductCatalog' />,
            onRenderText: props => <Stack horizontalAlign='center' tokens={{ childrenGap: 4 }}>
                <Text {...props} variant='large' />
                <Text>Import your supplier's price list to start selling.</Text>
            </Stack>,
        },
    },
}

//the overlay's text is a label
const LABELS = { 'grid.noRecordsFound': 'Your catalogue has no products yet.' }

//a catalogue with no products yet
const createEmptyCatalogue = () => {
    const products = createProductsProvider()
    products.setDataSource([])
    return products
}

const GridExample = () => <LabelsProvider labels={LABELS}>
    <DatasetControl onLoad={async () => ({ provider: createEmptyCatalogue() })}>
        <DatasetControl.Body>
            <ClientSideGrid components={COMPONENTS} height='360px' />
        </DatasetControl.Body>
    </DatasetControl>
</LabelsProvider>
`

export const WAREHOUSE_LOADING_CODE = `import { createWarehouseProducts } from './warehouse'

const styles = mergeStyleSets({
    card: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: 300, padding: 24, borderRadius: 8, background: '#ffffff', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.14)' },
    truck: { fontSize: 36, color: '#0078d4' },
    progress: { width: '100%' },
})

const COMPONENTS: IGridComponents = {
    overlays: {
        loading: {
            onRenderContainer: props => <div {...props} className={styles.card} />,
            onRenderSpinner: () => <>
                <Icon iconName='DeliveryTruck' className={styles.truck} />
                <ProgressIndicator className={styles.progress} />
            </>,
        },
    },
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: createWarehouseProducts() })}>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.Ribbon enableRefresh />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid components={COMPONENTS} height='400px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const LOADING_ROWS_CODE = `import { createWarehouseProducts } from './warehouse'

const styles = mergeStyleSets({
    loadingRow: { display: 'flex', alignItems: 'center', gap: 8, height: '100%', padding: '0 16px' },
})

const COMPONENTS: IGridComponents = {
    rows: {
        loading: {
            onRenderShimmer: () => <div className={styles.loadingRow}>
                <Spinner />
                <span>Fetching this category's products from the warehouse…</span>
            </div>,
        },
    },
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: createWarehouseProducts() })}>
    <DatasetControl.Body>
        <ServerSideGrid modules={[createGroupingModule()]} components={COMPONENTS} height='420px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const ERROR_ROWS_CODE = `import { createWarehouseProducts } from './warehouse'

const RetryMessageBar = (props: IMessageBarProps) => {
    const gridApi = useGridService('gridApi')

    return <MessageBar
        {...props}
        messageBarType={MessageBarType.warning}
        isMultiline={false}
        //AG Grid loads the failed rows again
        actions={<MessageBarButton text='Try again' onClick={() => gridApi?.retryServerSideLoads()} />}>
        The warehouse did not answer for this category.
    </MessageBar>
}

const COMPONENTS: IGridComponents = {
    rows: {
        error: {
            onRenderMessageBar: props => <RetryMessageBar {...props} />,
        },
    },
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: createWarehouseProducts() })}>
    <DatasetControl.Body>
        <ServerSideGrid modules={[createGroupingModule()]} components={COMPONENTS} height='420px' />
    </DatasetControl.Body>
</DatasetControl>
`

const SLOW_WAREHOUSE_FILE: IGridExampleFile = {
    name: 'warehouse.ts',
    code: `//stands in for a warehouse system that takes its time to answer
class WarehouseProducts extends MemoryDataProvider {
    public async getDataAsync(...parameters: Parameters<MemoryDataProvider['getDataAsync']>) {
        //the text the loading overlay shows
        this.setLoading(true, "Asking the warehouse for today's stock levels…")
        await new Promise(resolve => window.setTimeout(resolve, 2500))
        return super.getDataAsync(...parameters)
    }
}

export const createWarehouseProducts = () => {
    const products = createProductsProvider()
    const warehouse = new WarehouseProducts({ dataSource: products.getDataSource(), metadata: products.getMetadata() })
    warehouse.setColumns(products.getColumns())
    return warehouse
}
`,
}

const SLOW_CATEGORIES_FILE: IGridExampleFile = {
    name: 'warehouse.ts',
    code: `//stands in for a warehouse that takes its time over each category
class WarehouseProducts extends MemoryDataProvider {
    public async getDataAsync(...parameters: Parameters<MemoryDataProvider['getDataAsync']>) {
        //a category's products are fetched by a provider of the category's own
        if (this.getParentDataProvider()) {
            await new Promise(resolve => window.setTimeout(resolve, 2000))
        }
        return super.getDataAsync(...parameters)
    }
}

export const createWarehouseProducts = () => {
    const products = createProductsProvider()
    const warehouse = new WarehouseProducts({ dataSource: products.getDataSource(), metadata: products.getMetadata() })
    warehouse.setColumns(products.getColumns())
    warehouse.grouping.addGroupBy({ columnName: 'category', alias: 'category_group' })
    return warehouse
}
`,
}

const FLAKY_WAREHOUSE_FILE: IGridExampleFile = {
    name: 'warehouse.ts',
    code: `//stands in for a warehouse that drops the first category it is asked for
export const createWarehouseProducts = () => {
    let hasFailed = false
    class WarehouseProducts extends MemoryDataProvider {
        public async getDataAsync(...parameters: Parameters<MemoryDataProvider['getDataAsync']>) {
            //a category's products are fetched by a provider of the category's own
            if (this.getParentDataProvider()) {
                await new Promise(resolve => window.setTimeout(resolve, 2000))
                if (!hasFailed) {
                    hasFailed = true
                    throw new Error('The warehouse did not answer.')
                }
            }
            return super.getDataAsync(...parameters)
        }
    }
    const products = createProductsProvider()
    const warehouse = new WarehouseProducts({ dataSource: products.getDataSource(), metadata: products.getMetadata() })
    warehouse.setColumns(products.getColumns())
    warehouse.grouping.addGroupBy({ columnName: 'category', alias: 'category_group' })
    return warehouse
}
`,
}

export const RICH_TEXT_CODE = `const styles = mergeStyleSets({
    html: {
        width: '100%',
        minWidth: 0,
        padding: '8px 9px',
        lineHeight: '1.45',
        //AG Grid keeps a cell's text on one line
        whiteSpace: 'normal',
        overflowWrap: 'anywhere',
        '& p': { margin: '0 0 4px' },
        '& ul, & ol': { margin: '0 0 4px', paddingLeft: 18 },
        '& a': { color: 'inherit', textDecoration: 'underline' },
    },
    editor: { width: 460, background: '#ffffff', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)', borderRadius: 4 },
})

//sanitized: users type this HTML
const HtmlValue = () => {
    const field = useGridField()!
    return <div className={styles.html} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(field.getValue() ?? '') }} />
}

const RichTextInput = () => {
    const field = useGridField()!
    const [html, setHtml] = React.useState<string>(field.getValue() ?? '')

    const onChange = (value: string) => {
        setHtml(value)
        field.setValue(value)
    }

    return <div className={styles.editor}>
        {/* react-simple-wysiwyg's editor, with its toolbar */}
        <DefaultEditor value={html} onChange={event => onChange(event.target.value)} autoFocus />
    </div>
}

const HTML_RENDERER: ICellRendererComponents = {
    columnControl: { onRenderControl: () => <HtmlValue /> },
}

const HTML_EDITOR: IEditingCellEditorComponents = {
    columnControl: { onRenderControl: () => <RichTextInput /> },
}

const onSetup = (grid: IGrid) => {
    grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
        Object.assign(columnDefs.find(colDef => colDef.colId === 'description')!, {
            cellRendererParams: { components: HTML_RENDERER },
            cellEditorParams: { components: HTML_EDITOR },
            cellEditorPopup: true,
            autoHeight: true,
            //Enter starts a new line in the editor rather than closing it
            suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => params.editing && params.event.key === 'Enter',
        })
    })
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createEditingModule()]}
            onSetup={onSetup}
            height='520px' />
    </DatasetControl.Body>
</DatasetControl>
`

const DESCRIPTIONS: { [name: string]: string } = {
    'Standing desk': '<p><b>Sit, stand, repeat.</b> Electric lift from 62 to 128 cm with <i>four memory presets</i>.</p><ul><li>Solid oak top</li><li>Cable tray included</li></ul>',
    'Corner desk': '<p>An L-shaped desk that turns a <b>dead corner</b> into a workstation.</p>',
    'Ergonomic chair': '<p><b>All-day comfort:</b></p><ul><li>Adjustable lumbar support</li><li>4D armrests</li><li>Breathable mesh back</li></ul>',
    'Meeting chair': '<p>Stackable, light and <u>easy to wipe clean</u>. Back in stock <b>next month</b>.</p>',
    'Desk lamp': '<p>Warm or cool light, dimmable, with a <b>USB-C port</b> in the base.</p>',
    'Floor lamp': '<p>Arched floor lamp for reading corners. <i>Bulb not included.</i></p>',
    'Filing cabinet': '<p>Three lockable drawers on <b>soft-close runners</b>.</p><ol><li>A4 files</li><li>Hanging folders</li><li>Stationery</li></ol>',
    'Bookshelf': '<p>Five shelves, <b>discontinued</b>: sell the remaining stock first.</p>',
}

const createDescriptionsProvider = () => {
    const columns = PRODUCT_COLUMNS.filter(column => ['photo', 'name', 'price', 'instock'].includes(column.name))
        .map(column => column.name === 'photo' ? { ...column, visualSizeFactor: 150 } : column)
    const provider = createMemoryProvider({
        primaryIdAttribute: 'docs_productid',
        primaryNameAttribute: 'name',
        logicalName: 'docs_product',
        rows: PRODUCT_ROWS.filter(row => DESCRIPTIONS[row.name]).map(row => ({ ...row, description: DESCRIPTIONS[row.name] })),
        columns: [
            ...columns.slice(0, 2),
            { name: 'description', dataType: DataTypes.Multiple, displayName: 'Description', visualSizeFactor: 420, metadata: metadataFor(DataTypes.Multiple) },
            ...columns.slice(2),
        ],
    })
    provider.refresh()
    return provider
}

export const WinChanceExample = () => <GridExampleRunner seedCode={WIN_CHANCE_CODE} dataset='deals' />

export const RichTextExample = () => <GridExampleRunner seedCode={RICH_TEXT_CODE} onCreateProvider={createDescriptionsProvider} />

export const HeaderCaptionExample = () => <GridExampleRunner seedCode={HEADER_CAPTION_CODE} dataset='products' />

export const PipelineHeaderExample = () => <GridExampleRunner seedCode={PIPELINE_HEADER_CODE} dataset='deals' />

export const EmptyCatalogueExample = () => <GridExampleRunner seedCode={EMPTY_CATALOGUE_CODE} tabs={['preview', 'code']} />

export const WarehouseLoadingExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: WAREHOUSE_LOADING_CODE }, SLOW_WAREHOUSE_FILE]} tabs={['preview', 'code']} />

export const LoadingRowsExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: LOADING_ROWS_CODE }, SLOW_CATEGORIES_FILE]} tabs={['preview', 'code']} />

export const ErrorRowsExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: ERROR_ROWS_CODE }, FLAKY_WAREHOUSE_FILE]} tabs={['preview', 'code']} />
