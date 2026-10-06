import React from 'react'
import { DataTypes, MemoryDataProvider } from '@talxis/client-libraries'
import { GridExampleRunner } from '../GridExampleRunner'
import { createDocsDataset, createProductsProvider, PRODUCT_COLUMNS, PRODUCT_ROWS } from '../data'
import { createMemoryProvider, metadataFor } from '../data/metadata'

export const WIN_CHANCE_CODE = `const STAGE_COLORS: { [stage: number]: string } = { 1: '#8a8886', 2: '#0078d4', 3: '#c19c00', 4: '#107c10', 5: '#a4262c' }
const isClosed = (deal: IRecord) => Number(deal.getValue('stage')) >= 4

const styles = mergeStyleSets({
    chance: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px' },
    ring: { flexShrink: 0, transform: 'rotate(-90deg)' },
    percent: { fontWeight: 600, fontVariantNumeric: 'tabular-nums' },
    verdict: { fontSize: 12, opacity: 0.7 },
})

const getVerdict = (chance: number) => chance >= 80 ? 'Strong' : chance >= 50 ? 'Likely' : chance >= 25 ? 'Possible' : 'Long shot'

const RADIUS = 9
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const WinChance = () => {
    const { palette } = useGridCell().getTheme().get()
    const field = useGridField()!
    const chance = Number(field.getValue() ?? 0)
    const filled = Math.min(Math.max(chance, 0), 100) / 100 * CIRCUMFERENCE

    return <div className={styles.chance}>
        <svg className={styles.ring} width={24} height={24} viewBox='0 0 24 24'>
            <circle cx={12} cy={12} r={RADIUS} fill='none' strokeWidth={3} stroke={palette.neutralLighter} />
            {filled > 0 && <circle cx={12} cy={12} r={RADIUS} fill='none' strokeWidth={3} strokeLinecap='round' stroke={STAGE_COLORS[Number(field.getRecord().getValue('stage'))]}
                strokeDasharray={filled + ' ' + CIRCUMFERENCE} style={{ transition: 'stroke-dasharray 0.4s ease' }} />}
        </svg>
        <span className={styles.percent}>{chance}%</span>
        <span className={styles.verdict}>{getVerdict(chance)}</span>
    </div>
}

//the editing module is on, so the root comes from EditingCell
const WinChanceCell = (props: IGridCellParams) => <Grid.Cell.Field record={props.data} name={props.colDef!.colId!}>
    <EditingCell.Root {...props}>
        <Grid.Cell.Theme>
            <Grid.Cell.Container>
                <Grid.Cell.Loading>
                    <CellLockIcon />
                    <Grid.Cell.Control>
                        <WinChance />
                    </Grid.Cell.Control>
                    <Grid.Cell.Commands />
                    <Grid.Cell.FieldError />
                </Grid.Cell.Loading>
            </Grid.Cell.Container>
        </Grid.Cell.Theme>
    </EditingCell.Root>
</Grid.Cell.Field>

const FORECAST_DELAY = 1200

const GridExample = () => {
    const runtime = React.useRef<IGridRuntime>()
    const [forecasting] = React.useState(() => new Set<string>())

    //stands in for a forecasting service
    const forecast = async (deal: IRecord) => {
        const cells = runtime.current!.services.get('cells')
        forecasting.add(deal.getRecordId())
        cells.render()
        await new Promise(resolve => window.setTimeout(resolve, FORECAST_DELAY))
        forecasting.delete(deal.getRecordId())
        const chance = Number(deal.getValue('stage')) * 25 - 15 + Math.round(Math.random() * 20)
        await runtime.current!.services.get('fields').get(deal, 'probability').setValue(chance)
        cells.render()
    }

    return <Grid.Root
        provider={provider}
        modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule({ autoSave: true }) }}
        enableOptionSetColors
        colDefs={{
            products: { hide: true },
            probability: {
                headerName: 'Win chance',
                cellRenderer: WinChanceCell,
                initialWidth: 220,
                settings: {
                    alignment: 'left',
                    cell: {
                        onGetLoading: (result, { record }) => {
                            result.isLoading = forecasting.has(record.getRecordId())
                        },
                        onGetLock: (result, { record }) => {
                            result.isLocked = isClosed(record)
                        },
                        onGetValidation: (result, { record }) => {
                            const chance = Number(record.getValue('probability') ?? 0)
                            if (chance < 0 || chance > 100) {
                                result.error = true
                                result.errorMessage = 'A win chance is between 0 and 100 %.'
                            }
                        },
                        onGetCommands: (result, { record }) => {
                            if (!isClosed(record)) {
                                result.items.push({ key: 'forecast', text: 'Forecast', iconOnly: true, iconProps: { iconName: 'Lightbulb' }, onClick: () => { forecast(record) } })
                            }
                        },
                    },
                },
            },
        }}
        onGridReady={gridRuntime => { runtime.current = gridRuntime }}
        height='440px' />
}
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

const CaptionedHeader = (props: IColumnHeaderRendererProps) => <Grid.ColumnHeader.Renderer {...props} components={CAPTIONED_HEADER} />

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        sorting: createSortingModule(),
    }}
    colDefs={{
        price: { headerComponent: CaptionedHeader },
        instock: { headerComponent: CaptionedHeader },
        reorderlevel: { headerComponent: CaptionedHeader },
    }}
    height='440px' />
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
    const runtime = React.useRef<IGridRuntime>()

    //the totals load on their own, so the headers are redrawn once they arrive
    React.useEffect(() => {
        totals.getDataProvider().addEventListener('onLoading', isLoading => {
            if (!isLoading) {
                runtime.current?.services.get('columns').headers.render()
            }
        })
    }, [])

    return <Grid.Root
        provider={provider}
        modules={{ rowModel: createClientSideRowModelModule(), sorting: createSortingModule() }}
        colDefs={{
            value: { headerComponent: SummaryHeader },
            probability: { headerComponent: SummaryHeader },
        }}
        onGridReady={gridRuntime => { runtime.current = gridRuntime }}
        height='440px' />
}
`

export const EMPTY_CATALOGUE_CODE = `const COMPONENTS: IGridComponents = {
    emptyRecordsOverlay: {
        onRenderIcon: props => <Icon {...props} iconName='ProductCatalog' />,
        onRenderText: props => <Stack horizontalAlign='center' tokens={{ childrenGap: 4 }}>
            <Text {...props} variant='large' />
            <Text>Import your supplier's price list to start selling.</Text>
        </Stack>,
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule() }}
    labels={{ noRecordsFound: 'Your catalogue has no products yet.' }}
    components={COMPONENTS}
    height='360px' />
`

export const WAREHOUSE_LOADING_CODE = `const styles = mergeStyleSets({
    card: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: 300, padding: 24, borderRadius: 8, background: '#ffffff', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.14)' },
    truck: { fontSize: 36, color: '#0078d4' },
    progress: { width: '100%' },
})

const COMPONENTS: IGridComponents = {
    loadingOverlay: {
        onRenderContainer: props => <div {...props} className={styles.card} />,
        onRenderSpinner: () => <>
            <Icon iconName='DeliveryTruck' className={styles.truck} />
            <ProgressIndicator className={styles.progress} />
        </>,
    },
}

const GridExample = () => <Stack horizontalAlign='start' tokens={{ childrenGap: 8 }}>
    <DefaultButton iconProps={{ iconName: 'Refresh' }} text='Check stock again' onClick={() => provider.refresh()} />
    <Stack.Item align='stretch'>
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule() }}
            components={COMPONENTS}
            height='400px' />
    </Stack.Item>
</Stack>
`

export const LOADING_ROWS_CODE = `const styles = mergeStyleSets({
    loadingRow: { display: 'flex', alignItems: 'center', gap: 8, height: '100%', padding: '0 16px' },
})

const COMPONENTS: IGridComponents = {
    rowLoading: {
        onRenderShimmer: () => <div className={styles.loadingRow}>
            <Spinner />
            <span>Fetching this category's products from the warehouse…</span>
        </div>,
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createServerSideRowModelModule(),
        grouping: createGroupingModule(),
    }}
    components={COMPONENTS}
    height='420px' />
`

export const SAVE_STATUS_CODE = `const SaveErrorTitle = (props: ITextProps) => {
    const product = useGridCell().getRecord()
    return <Text {...props}>{product.getFormattedValue('name')}: {props.children}</Text>
}

const COMPONENTS: IGridEditingComponents = {
    recordSaveCell: {
        indicator: {
            onRenderButton: ({ state, ...props }) => <ActionButton {...props} text={state === 'failed' ? 'Not saved' : 'Saved'} />,
        },
        errorCallout: {
            onRenderTitle: props => <SaveErrorTitle {...props} />,
        },
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule({ autoSave: true, components: COMPONENTS }) }}
    colDefs={{
        [RECORD_SAVE_COLUMN_KEY]: { width: 112 },
    }}
    height='440px' />
`

export const MODULE_ICONS_CODE = `const styles = mergeStyleSets({
    icon: { color: '#0078d4' },
    count: { marginLeft: 4, padding: '0 8px', borderRadius: 10, background: '#edebe9', fontSize: 12, lineHeight: '18px' },
})

//the part is handed the count as text in brackets
const ProductCount = (props: { className?: string }) => {
    const cell = useGridCell()
    const count = useGridService('grouping')?.getGroupedCount(cell.getRecord(), cell.getColumnName())
    return <span className={props.className}><span className={styles.count}>{count}</span></span>
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        sorting: createSortingModule({
            components: {
                sortIcon: { onRenderIcon: ({ descending, ...props }) => <Icon {...props} iconName={descending ? 'CaretDownSolid8' : 'CaretUpSolid8'} className={styles.icon} /> },
            },
        }),
        filtering: createFilteringModule({
            components: {
                filterIcon: { onRenderIcon: props => <Icon {...props} iconName='FilterSolid' className={styles.icon} /> },
            },
        }),
        grouping: createGroupingModule({
            defaultExpandedLevel: 0,
            components: {
                groupingIcon: { onRenderIcon: props => <Icon {...props} className={styles.icon} /> },
                groupCell: { count: { onRenderCount: props => <ProductCount className={props.className} /> } },
            },
        }),
    }}
    height='460px' />
`

const WAREHOUSE_DELAY = 2500
const GROUP_DELAY = 2000

//stands in for a warehouse system that takes its time to answer
class WarehouseProductsProvider extends MemoryDataProvider {
    public async getDataAsync(...parameters: Parameters<MemoryDataProvider['getDataAsync']>) {
        const isGroupLoad = !!this.getParentDataProvider()
        if (!isGroupLoad) {
            this.setLoading(true, "Asking the warehouse for today's stock levels…")
        }
        await new Promise(resolve => window.setTimeout(resolve, isGroupLoad ? GROUP_DELAY : WAREHOUSE_DELAY))
        return super.getDataAsync(...parameters)
    }
}

const createWarehouseProvider = (groupByCategory: boolean) => {
    const products = createProductsProvider()
    const provider = new WarehouseProductsProvider({ dataSource: products.getDataSource(), metadata: products.getMetadata() })
    provider.setColumns(products.getColumns())
    provider.getPaging().setPageSize(products.getDataSource().length)
    if (groupByCategory) {
        provider.grouping.addGroupBy({ columnName: 'category', alias: 'category_group' })
    }
    provider.refresh()
    return provider
}

const createEmptyCatalogue = () => {
    const provider = createProductsProvider()
    provider.setDataSource([])
    provider.refresh()
    return provider
}

const PRICE_APPROVAL_LIMIT = 1000
const PRICING_DELAY = 600

//stands in for a pricing service that sends big prices to a manager first
const createPricingProvider = () => {
    const provider = createDocsDataset('products')
    provider.setInterceptor('onRecordSave', async (record, defaultAction) => {
        await new Promise(resolve => window.setTimeout(resolve, PRICING_DELAY))
        if (!record.isDirty('price') || Number(record.getValue('price') ?? 0) <= PRICE_APPROVAL_LIMIT) {
            return defaultAction(record)
        }
        return { recordId: record.getRecordId(), success: false, fields: [], errors: [{ fieldName: 'price', message: "A price over $1,000 needs the category manager's approval." }] }
    })
    return provider
}

const createSortedCatalogue = () => {
    const provider = createProductsProvider()
    provider.grouping.addGroupBy({ columnName: 'category', alias: 'category_group' })
    provider.setSorting([{ name: 'price', sortDirection: 1 }])
    provider.refresh()
    return provider
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

//what users type is HTML, so it is sanitized before the cell draws it
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

const HTML_RENDERER: IEditingCellRendererComponents = {
    columnControl: { onRenderControl: () => <HtmlValue /> },
}

const HTML_EDITOR: IEditingCellEditorComponents = {
    columnControl: { onRenderControl: () => <RichTextInput /> },
}

//the editing module is on, so the cells come from EditingCell
const HtmlCell = (props: IGridCellParams) => <Grid.Cell.Field record={props.data} name={props.colDef!.colId!}>
    <EditingCell.Renderer {...props} components={HTML_RENDERER} />
</Grid.Cell.Field>

const HtmlEditor = (props: IGridCellParams) => <Grid.Cell.Field record={props.data} name={props.colDef!.colId!}>
    <EditingCell.Editor {...props} components={HTML_EDITOR} />
</Grid.Cell.Field>

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule() }}
    colDefs={{
        description: {
            cellRenderer: HtmlCell,
            cellEditor: HtmlEditor,
            cellEditorPopup: true,
            autoHeight: true,
            //Enter starts a new line in the editor rather than closing it
            suppressKeyboardEvent: params => params.editing && params.event.key === 'Enter',
        },
    }}
    height='520px' />
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

export const EmptyCatalogueExample = () => <GridExampleRunner seedCode={EMPTY_CATALOGUE_CODE} onCreateProvider={createEmptyCatalogue} />

export const WarehouseLoadingExample = () => <GridExampleRunner seedCode={WAREHOUSE_LOADING_CODE} onCreateProvider={() => createWarehouseProvider(false)} />

export const LoadingRowsExample = () => <GridExampleRunner seedCode={LOADING_ROWS_CODE} onCreateProvider={() => createWarehouseProvider(true)} />

export const SaveStatusExample = () => <GridExampleRunner seedCode={SAVE_STATUS_CODE} onCreateProvider={createPricingProvider} />

export const ModuleIconsExample = () => <GridExampleRunner seedCode={MODULE_ICONS_CODE} onCreateProvider={createSortedCatalogue} />
