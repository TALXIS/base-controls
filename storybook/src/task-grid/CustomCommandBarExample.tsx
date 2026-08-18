import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` and `pcfContext` come from the sandbox. */
export const CUSTOM_COMMAND_BAR_CODE = `/** The command's Fluent icon name → the Material icon that means the same thing. */
const COMMAND_ICONS: Record<string, React.ElementType> = {
    Add: AddIcon,
    AddToShoppingList: PlaylistAddIcon,
    Edit: EditIcon,
    Delete: DeleteIcon,
    ColumnOptions: ViewColumnIcon,
    Settings: SettingsIcon,
}

const CommandIcon = (props: { name?: string }) => {
    const IconComponent = props.name ? COMMAND_ICONS[props.name] : undefined
    if (!IconComponent) {
        return <></>
    }
    return <IconComponent fontSize="small" />
}

const MuiCommandBar = (props: ITaskGridCommandBarProps) => {
    const [menu, setMenu] = React.useState<{ anchor: HTMLElement, item: ITaskGridCommandBarItem } | null>(null)
    const [completedCount, setCompletedCount] = React.useState(0)
    //the bar renders inside the grid, so it can reach the provider behind it
    const dataProvider = useTaskDataProvider()
    const selectedIds = dataProvider.getSelectedRecordIds()

    //a bulk action of our own: write both columns on every selected task, then one save for all of them
    const onMarkDone = async () => {
        const records = dataProvider.getRecordsMap()
        for (const id of selectedIds) {
            records[id].setValue('statuscode', 5)
            records[id].setValue('percentcomplete', 100)
        }
        //no argument saves every dirty record, so the whole selection goes in one round trip
        await dataProvider.save()
        setCompletedCount(selectedIds.length)
        dataProvider.clearSelectedRecordIds()
    }

    const onClick = (event: React.MouseEvent<HTMLElement>, item: ITaskGridCommandBarItem) => {
        //an item with a submenu opens one instead of acting
        if (item.subMenuProps) {
            setMenu({ anchor: event.currentTarget, item })
            return
        }
        item.onClick?.(event)
    }

    return <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center" pl={1} mr={1} py={0.5}>
        {(props.items ?? []).map(item => <Button
            key={item.key}
            size="small"
            //MUI upper-cases button labels by default and sets them small, the grid's commands are neither
            sx={{ textTransform: 'none', fontSize: 14 }}
            disabled={item.disabled}
            //the item brings its own icon name, so the bar only has to map it onto a Material icon
            startIcon={<CommandIcon name={item.iconProps?.iconName} />}
            onClick={(event) => onClick(event, item)}>
            {item.text}
        </Button>)}
        {/* nothing says the bar may only render the grid's commands - this one is entirely ours */}
        <Button
            size="small"
            variant="contained"
            disableElevation
            sx={{ textTransform: 'none', fontSize: 14 }}
            startIcon={<DoneAllIcon fontSize="small" />}
            disabled={selectedIds.length === 0}
            onClick={onMarkDone}>
            Mark done
        </Button>
        <Snackbar
            open={completedCount > 0}
            autoHideDuration={2500}
            onClose={() => setCompletedCount(0)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert severity="success" onClose={() => setCompletedCount(0)}>
                {completedCount} task(s) marked done.
            </Alert>
        </Snackbar>
        <Menu open={!!menu} anchorEl={menu?.anchor} onClose={() => setMenu(null)}>
            {menu?.item.subMenuProps?.onRenderMenuList?.() ?? (menu?.item.subMenuProps?.items ?? []).map(subItem =>
                <MenuItem
                    key={subItem.key}
                    disabled={subItem.disabled}
                    onClick={() => {
                        subItem.onClick?.()
                        setMenu(null)
                    }}>
                    {subItem.text}
                </MenuItem>)}
        </Menu>
    </Stack>
}

const components: Partial<ITaskGridComponents> = {
    onRenderCommandBar: (props) => <MuiCommandBar {...props} />,
}

const TaskGridExample = () => <TaskGrid
    pcfContext={pcfContext}
    taskGridDescriptor={descriptor}
    components={components} />
`

export const CustomCommandBarExample = () => <TaskGridExampleRunner seedCode={CUSTOM_COMMAND_BAR_CODE} />
