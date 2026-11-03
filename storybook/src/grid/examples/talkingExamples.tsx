import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const DRIVE_THE_GRID_CODE = `const createReviewProvider = () => {
    const timesheets = createTimesheetsProvider()
    timesheets.grouping.addGroupBy({ columnName: 'status', alias: 'status_group' })
    timesheets.aggregation.addAggregation({ columnName: 'hours', alias: 'hours_sum', aggregationFunction: 'sum' })
    return timesheets
}

const GridExample = () => {
    const timesheets = React.useMemo(createReviewProvider, [])
    const gridRef = React.useRef<IGrid>()
    const [summary, setSummary] = React.useState('')

    const summarize = () => {
        const sorting = timesheets.getSorting()[0]
        setSummary(\`\${timesheets.getRecords().length} groups\${sorting ? \`, sorted by \${sorting.name}\` : ''}\`)
    }

    const onReady = (grid: IGrid) => {
        gridRef.current = grid
        grid.events.addEventListener('onDataLoaded', summarize)
        summarize()
    }

    const expandAll = () => {
        const grouping = gridRef.current?.modules.find('grouping')
        grouping?.setExpandedLevel(grouping.getDeepestLevel())
    }

    const collapseAll = () => gridRef.current?.modules.find('grouping')?.setExpandedLevel(-1)

    const sortByHours = () => gridRef.current?.modules.find('sorting')?.sortColumn('hours', true)

    const loadCommands = async (): Promise<IRibbonCommand[]> => [
        { id: 'expandAll', label: 'Expand all', iconName: 'ExploreContent', onExecute: expandAll },
        { id: 'collapseAll', label: 'Collapse all', iconName: 'CollapseContent', onExecute: collapseAll },
        { id: 'sortByHours', label: 'Most hours first', iconName: 'SortDown', onExecute: sortByHours },
    ]

    return <DatasetControl onLoad={async () => ({ provider: timesheets })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.Ribbon onLoad={loadCommands} />
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <Text>{summary}</Text>
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <Grid
                modules={[
                    createClientSideRowModelModule(),
                    createSortingModule(),
                    createGroupingModule(),
                    createAggregationModule(),
                ]}
                enableOptionSetColors
                onReady={onReady}
                height='440px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const GRID_LIFE_CODE = `const HIGH = 1

const createLifeLogModule = (log: (message: string) => void): IGridModule => ({
    name: 'lifeLog',
    onLoad: grid => {
        log('onLoad: the grid mounts, AG Grid is not there yet')
        grid.services.get('cells').registerCellTheme((builder, { record }) => {
            if (Number(record.getValue('priority')) === HIGH) {
                builder.tint(grid.services.get('theme').semanticColors.errorText)
            }
        })
        grid.services.observe('gridApi', gridApi => {
            log(\`gridApi: \${gridApi.getDisplayedRowCount()} rows on screen\`)
            const onResize = () => gridApi.sizeColumnsToFit()
            window.addEventListener('resize', onResize)
            //the cleanup runs while AG Grid still works
            return () => {
                window.removeEventListener('resize', onResize)
                log(\`gridApi cleanup: the focused column was \${gridApi.getFocusedCell()?.column.getColId() ?? 'none'}\`)
            }
        })
        grid.events.addEventListener('onDestroyed', () => log('onDestroyed: AG Grid is gone'))
    },
})

const GridExample = () => {
    const theme = useTheme()
    const [lines, setLines] = React.useState<string[]>([])
    const [mountCount, setMountCount] = React.useState(0)
    //deferred: onLoad runs while the grid renders
    const log = (message: string) => window.setTimeout(() => setLines(current => [...current, message]))
    const lifeLog = React.useMemo(() => createLifeLogModule(log), [])

    return <Stack tokens={{ childrenGap: 12 }}>
        <DatasetControl onLoad={async () => ({ provider: provider })}>
            <DatasetControl.Header>
                <DatasetControl.Header.Start>
                    <DefaultButton iconProps={{ iconName: 'Refresh' }} text='Close and reopen' onClick={() => setMountCount(count => count + 1)} />
                </DatasetControl.Header.Start>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <Grid key={mountCount} modules={[createClientSideRowModelModule(), lifeLog]} height='320px' />
            </DatasetControl.Body>
        </DatasetControl>
        <Stack tokens={{ childrenGap: 4 }} styles={{ root: { padding: 12, borderRadius: 4, background: theme.semanticColors.bodyStandoutBackground } }}>
            {lines.map((line, index) => <Text key={index} variant='small'>{line}</Text>)}
        </Stack>
    </Stack>
}
`

export const DriveTheGridExample = () => <GridExampleRunner seedCode={DRIVE_THE_GRID_CODE} dataset='timesheets' />

export const GridLifeExample = () => <GridExampleRunner seedCode={GRID_LIFE_CODE} dataset='tickets' />
