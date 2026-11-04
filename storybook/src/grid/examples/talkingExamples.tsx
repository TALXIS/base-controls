import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const ASSIGN_FROM_THE_RIBBON_CODE = `const ME = 'Eva Horák'

const GridExample = () => {
    const gridRef = React.useRef<IGrid>()
    const [summary, setSummary] = React.useState('')

    const summarize = () => {
        const sorting = provider.getSorting()[0]
        setSummary(sorting ? 'Sorted by ' + provider.getColumnsMap()[sorting.name]?.displayName : 'Not sorted')
    }

    //the grid onReady passes is what your code talks to
    const onReady = (grid: IGrid) => {
        gridRef.current = grid
        grid.events.addEventListener('onDataLoaded', summarize)
        summarize()
    }

    //a module, found by its name
    const sortByDeadline = () => gridRef.current?.modules.find('sorting')?.sortColumn('duedate')

    //a service: a field saves the ticket as its cell would
    const assignToMe = () => {
        const fields = gridRef.current?.services.get('fields')
        provider.getSelectedRecordIds().forEach(id => fields?.get(provider.getRecordsMap()[id], 'assignee').setValue(ME))
        provider.clearSelectedRecordIds()
    }

    //the ribbon loads again whenever the selection changes
    const loadCommands = async (): Promise<IRibbonCommand[]> => [
        { id: 'assign', label: 'Assign to me', iconName: 'AddFriend', isDisabled: provider.getSelectedRecordIds().length === 0, onExecute: assignToMe },
        { id: 'sort', label: 'Deadline first', iconName: 'SortUp', onExecute: sortByDeadline },
    ]

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
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
                    createEditingModule({ autoSave: true }),
                    createRowSelectionModule({ mode: 'multiple' }),
                    createSortingModule(),
                ]}
                enableOptionSetColors
                onReady={onReady}
                height='420px' />
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

export const AssignFromTheRibbonExample = () => <GridExampleRunner seedCode={ASSIGN_FROM_THE_RIBBON_CODE} dataset='tickets' />

export const GridLifeExample = () => <GridExampleRunner seedCode={GRID_LIFE_CODE} dataset='tickets' />
