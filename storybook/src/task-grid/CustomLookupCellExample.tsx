import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` and `pcfContext` come from the sandbox. */
export const CUSTOM_LOOKUP_CELL_CODE = `interface IPerson {
    id: string
    name: string
    imageurl?: string
}

const AssignedToCell = (props: ITaskGridCellProps) => {
    const columnName = props.baseColumn?.name ?? ''
    //a lookup column's value is one entry per referenced record, each carrying whatever the strategy
    //attached to it - here the person's image url
    const assigned = (props.value.value ?? []) as ITaskGridEntityReference[]
    const [anchor, setAnchor] = React.useState<HTMLElement | null>(null)
    const [people, setPeople] = React.useState<IPerson[]>([])
    //what the picker shows while it is open. The record is written on every change, but the cell is not
    //refreshed until the picker closes - refreshing mid-edit would take the focus and shut the list
    const [pending, setPending] = React.useState<IPerson[] | null>(null)

    //the descriptor knows what a lookup column may point at, so the candidates come from there
    React.useEffect(() => {
        if (!anchor || people.length > 0 || !props.baseColumn) {
            return
        }
        const provider = descriptor.onCreateLookupManyDataProvider?.({ record: props.record, column: props.baseColumn })
        provider?.refresh().then(() => setPeople(provider.getRecords().map(candidate => ({
            id: candidate.getRecordId(),
            name: candidate.getNamedReference().name ?? '',
            imageurl: candidate.getValue('imageurl'),
        }))))
    }, [anchor])

    const onChange = (selected: IPerson[]) => {
        setPending(selected)
        props.record.setValue(columnName, selected.map(person => ({
            id: { guid: person.id },
            name: person.name,
            etn: 'mem_person',
            rawData: { imageurl: person.imageurl },
        })))
        props.record.save()
    }

    const onClose = () => {
        setAnchor(null)
        setPending(null)
        props.api?.refreshCells({ rowNodes: [props.node], columns: [columnName], force: true })
    }

    //the column is not editable through ag-grid, so the renderer owns the interaction: double clicking
    //the cell opens the picker, the same gesture that starts editing anywhere else in the grid. Do not
    //also bind onClick - the second click of the double click would land on the popover's backdrop and
    //close it again

    return <>
        <Stack
            //the row is taller than this cell's own content, and ag-grid gives the value its content
            //height - so take the row height to centre the avatars against the row rather than the text
            height={props.node?.rowHeight ?? '100%'}
            width="100%"
            px={1}
            justifyContent="center"
            alignItems="flex-start"
            onDoubleClick={(event) => setAnchor(event.currentTarget)}>
            {assigned.length === 0
                ? <Typography variant="caption" color="text.secondary">Unassigned</Typography>
                : <AvatarGroup
                    max={4}
                    spacing="small"
                    sx={{ '& .MuiAvatar-root': { width: 26, height: 26, fontSize: 12 } }}>
                    {assigned.map(person => <Tooltip key={person.id.guid} title={person.name ?? ''}>
                        <Avatar alt={person.name} src={person.rawData?.imageurl}>
                            {person.name?.charAt(0)}
                        </Avatar>
                    </Tooltip>)}
                </AvatarGroup>}
        </Stack>
        <Popover
            open={!!anchor}
            anchorEl={anchor}
            onClose={onClose}
            //without this the popover is still animating when the autocomplete measures its input, so
            //the option list anchors to where the input was and lands on top of it
            transitionDuration={0}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
            <Autocomplete
                multiple
                //the list stays open for as long as the picker is - a task usually gets more than one
                //person, and saving the record re-renders the grid, which resets the internal open state
                open
                disableCloseOnSelect
                sx={{ width: 320, p: 1 }}
                options={people}
                getOptionLabel={(person) => person.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={pending ?? people.filter(person => assigned.some(reference => reference.id.guid === person.id))}
                onChange={(event, selected) => onChange(selected as IPerson[])}
                renderInput={(params) => <TextField {...params} label="Assigned to" size="small" autoFocus />} />
        </Popover>
    </>
}

const components: Partial<ITaskGridComponents> = {
    onRenderCellRenderer: (props, defaultRender) => {
        //every other column, and the loading state of this one, stay with the grid's own cell
        if (props.baseColumn?.name !== 'assignedto' || props.value.loading) {
            return defaultRender(props)
        }
        return <AssignedToCell {...props} />
    },
}

const TaskGridExample = () => <TaskGrid
    pcfContext={pcfContext}
    taskGridDescriptor={descriptor}
    components={components} />
`

export const CustomLookupCellExample = () => <TaskGridExampleRunner seedCode={CUSTOM_LOOKUP_CELL_CODE} />
