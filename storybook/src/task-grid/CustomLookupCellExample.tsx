import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` comes from the sandbox. */
export const CUSTOM_LOOKUP_CELL_CODE = `interface IPerson {
    id: string
    name: string
    imageurl?: string
}

const AssignedTo = () => {
    const field = useGridField()!
    const services = useTaskGridRuntime().services
    //a lookup column's value is one entry per referenced record, each carrying whatever the strategy
    //attached to it - here the person's image url
    const assigned = (field.getValue() ?? []) as ComponentFramework.EntityReference[]
    const [anchor, setAnchor] = React.useState<HTMLElement | null>(null)
    const [people, setPeople] = React.useState<IPerson[]>([])

    //the lookup-many module builds the candidates for a column, so the options come from there
    React.useEffect(() => {
        if (!anchor || people.length > 0) {
            return
        }
        const loadPeople = async () => {
            const provider = services.get('lookupManyModule').createDataProvider({ record: field.getRecord(), column: field.getColumn(), services })!
            await provider.refresh()
            setPeople(provider.getRecords().map(candidate => ({
                id: candidate.getRecordId(),
                name: candidate.getNamedReference().name ?? '',
                imageurl: candidate.getValue('imageurl'),
            })))
        }
        loadPeople()
    }, [anchor])

    //the grid saves the record once the value is set
    const onChange = (selected: IPerson[]) => field.setValue(selected.map(person => ({
        id: { guid: person.id },
        name: person.name,
        etn: 'mem_person',
        rawData: { imageurl: person.imageurl },
    })))

    return <>
        <Stack height="100%" px={1} justifyContent="center" alignItems="flex-start" onClick={(event) => setAnchor(event.currentTarget)}>
            {assigned.length === 0
                ? <Typography variant="caption" color="text.secondary">Unassigned</Typography>
                : <AvatarGroup
                    max={4}
                    spacing="small"
                    sx={{ '& .MuiAvatar-root': { width: 26, height: 26, fontSize: 12 } }}>
                    {assigned.map(person => <Tooltip key={person.id.guid} title={person.name ?? ''}>
                        <Avatar alt={person.name} src={(person as any).rawData?.imageurl}>
                            {person.name?.charAt(0)}
                        </Avatar>
                    </Tooltip>)}
                </AvatarGroup>}
        </Stack>
        <Popover
            open={!!anchor}
            anchorEl={anchor}
            onClose={() => setAnchor(null)}
            //without this the popover is still animating when the autocomplete measures its input, so
            //the option list anchors to where the input was and lands on top of it
            transitionDuration={0}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
            <Autocomplete
                multiple
                //the list stays open for as long as the picker is - a task usually gets more than one person
                open
                disableCloseOnSelect
                sx={{ width: 320, p: 1 }}
                options={people}
                getOptionLabel={(person) => person.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={people.filter(person => assigned.some(reference => reference.id.guid === person.id))}
                onChange={(event, selected) => onChange(selected as IPerson[])}
                renderInput={(params) => <TextField {...params} label="Assigned to" size="small" autoFocus />} />
        </Popover>
    </>
}

const ASSIGNED_TO_CELL: ICellRendererComponents = {
    columnControl: { onRenderControl: () => <AssignedTo /> },
}

const AssignedToCell = (props: IGridCellParams) => <Grid.Cell.Field record={props.data} name={props.colDef!.colId!}>
    <Grid.Cell.Renderer {...props} components={ASSIGNED_TO_CELL} />
</Grid.Cell.Field>

const TaskGridExample = () => <TaskGrid
    descriptor={descriptor}
    colDefs={{
        assignedto: { cellRenderer: AssignedToCell },
    }} />
`

export const CustomLookupCellExample = () => <TaskGridExampleRunner seedCode={CUSTOM_LOOKUP_CELL_CODE} />
