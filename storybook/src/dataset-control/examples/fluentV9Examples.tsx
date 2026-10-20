import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { VIEWS_FILE, withFiles } from './shared'
import { USER_VIEWS_FILE } from './userViewsExamples'

const FLUENT_V9_CODE = `import { loadDealViews } from './views'
import { DealView, readViewData, loadView, writeViewData, userViews } from './userViews'
import { DealsRibbon, failNextLoad } from './DealsRibbon'
import { V9 } from './v9'
import { RecordDataGrid } from './RecordDataGrid'

//fails once after the ribbon asks it to, to show the error in Fluent v9 too
const onLoad = async (params: IDatasetControlLoadParameters<DealView>) => {
    if (failNextLoad.current) {
        failNextLoad.current = false
        await new Promise(resolve => setTimeout(resolve, 600))
        throw new Error('The deals service is not reachable.')
    }
    return loadView(params)
}

const GridExample = () => {
    const modules = React.useMemo(() => [createUserQueriesModule<DealView>({ provider: userViews, onReadViewData: readViewData, onWriteViewData: writeViewData })], [])

    return <DatasetControl modules={modules} onLoadViews={loadDealViews} onLoad={onLoad} stateKey='fluentV9' height='560px' components={V9.control}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher components={V9.viewSwitcher}>
                    <DatasetControl.UserQueries components={V9.userQueries} />
                </DatasetControl.ViewSwitcher>
                <DealsRibbon />
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <DatasetControl.EditColumns components={V9.editColumns} />
                <DatasetControl.QuickFind components={V9.quickFind} />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Notifications messages={[{ text: 'Deals are synced from the CRM every night.', level: 'INFO' }]} components={V9.notifications} />
        <DatasetControl.Body>
            <DatasetControl.EmptyRecords components={V9.emptyRecords}>
                <RecordDataGrid />
            </DatasetControl.EmptyRecords>
        </DatasetControl.Body>
        <DatasetControl.Footer>
            <DatasetControl.Footer.Start>
                <DatasetControl.PageSizeSwitcher components={V9.pageSizeSwitcher} />
            </DatasetControl.Footer.Start>
            <DatasetControl.Footer.End>
                <DatasetControl.Pagination components={V9.pagination} />
            </DatasetControl.Footer.End>
        </DatasetControl.Footer>
    </DatasetControl>
}
`

const DEALS_RIBBON_FILE: IGridExampleFile = {
    name: 'DealsRibbon.tsx',
    code: `import { V9 } from './v9'

const WON_STAGE = 4

/** Set by *Fail the next load*, read by the control's onLoad. */
export const failNextLoad = { current: false }

export const DealsRibbon = () => {
    const provider = useDataProvider()
    const control = useDatasetControl()

    const onLoad = async (): Promise<IRibbonCommand[]> => {
        const selectedIds = provider.getSelectedRecordIds()
        const commands: IRibbonCommand[] = [
            { id: 'refresh', label: 'Refresh', iconName: 'Refresh', onExecute: async () => { await provider.refresh() } },
            { id: 'breakConnection', label: 'Break the connection', iconName: 'PlugDisconnected', onExecute: () => provider.setError(true, 'The deals service is not reachable.') },
            { id: 'failNextLoad', label: 'Fail the next load', iconName: 'Warning', onExecute: async () => { failNextLoad.current = true; await control.reload() } },
        ]
        if (selectedIds.length > 0) {
            commands.push({ id: 'markWon', label: \`Mark \${selectedIds.length} as won\`, iconName: 'Trophy2', onExecute: async () => {
                await new Promise(resolve => setTimeout(resolve, 1000))
                selectedIds.forEach(id => provider.getRecordsMap()[id].setValue('stage', WON_STAGE))
            } })
            commands.push({ id: 'clearSelection', label: 'Clear selection', iconName: 'Clear', onExecute: () => provider.clearSelectedRecordIds() })
        }
        return commands
    }

    return <DatasetControl.Ribbon onLoad={onLoad} components={V9.ribbon} />
}
`,
}

const RECORD_DATA_GRID_FILE: IGridExampleFile = {
    name: 'RecordDataGrid.tsx',
    code: `import { createTableColumn, DataGrid, DataGridBody, DataGridCell, DataGridHeader, DataGridHeaderCell, DataGridRow, Input, tokens } from '@fluentui/react-components'

const TEXT_TYPES = [DataTypes.SingleLineText, DataTypes.Multiple]

/** The provider's records in its visible columns, sorted and selected through the provider; \`editable\` lets the user change text values. */
export const RecordDataGrid = (props: { editable?: boolean }) => {
    const provider = useDataProviderEvents(['onNewDataLoaded', 'onRecordsSelected', 'onRecordColumnValueChanged'])
    const columns = provider.getColumns().filter(column => !column.isHidden && !column.isVirtual).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const tableColumns = columns.map(column => createTableColumn<IRecord>({
        columnId: column.name,
        renderHeaderCell: () => column.displayName,
        renderCell: record => props.editable && TEXT_TYPES.includes(column.dataType as any)
            //a click in the field edits it, rather than selecting the row
            ? <Input appearance='underline' size='small' style={{ width: '100%' }} value={record.getValue(column.name) ?? ''} onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()} onChange={(_, data) => record.setValue(column.name, data.value)} />
            : record.getFormattedValue(column.name),
        //v9 counts the parameters to tell a sortable column; the provider sorts, so the rows keep its order
        compare: (_a: IRecord, _b: IRecord) => 0,
    }))
    const [sorting] = provider.getSorting()

    const sort = async (columnId: string, direction: 'ascending' | 'descending') => {
        provider.setSorting([{ name: columnId, sortDirection: direction === 'ascending' ? 0 : 1 }])
        await provider.refresh()
    }

    return <div style={{ height: '100%', overflow: 'auto' }}>
        <DataGrid
            items={provider.getRecords()}
            columns={tableColumns}
            getRowId={(record: IRecord) => record.getRecordId()}
            sortable
            sortState={sorting ? { sortColumn: sorting.name, sortDirection: sorting.sortDirection === 0 ? 'ascending' : 'descending' } : undefined}
            onSortChange={(_, state) => sort(\`\${state.sortColumn}\`, state.sortDirection)}
            selectionMode='multiselect'
            selectedItems={new Set(provider.getSelectedRecordIds())}
            onSelectionChange={(_, data) => provider.setSelectedRecordIds([...data.selectedItems] as string[])}>
            <DataGridHeader style={{ position: 'sticky', top: 0, zIndex: 1, background: tokens.colorNeutralBackground1 }}>
                <DataGridRow>
                    {({ renderHeaderCell }) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}
                </DataGridRow>
            </DataGridHeader>
            <DataGridBody<IRecord>>
                {({ item, rowId }) => <DataGridRow<IRecord> key={rowId}>
                    {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
                </DataGridRow>}
            </DataGridBody>
        </DataGrid>
    </div>
}
`,
}

const V9_FILE: IGridExampleFile = {
    name: 'v9.tsx',
    code: `import {
    Button, Caption1, DrawerBody, DrawerFooter, DrawerHeader, DrawerHeaderTitle, FluentProvider, Input, Menu, MenuButton, MenuDivider, MenuGroup,
    MenuGroupHeader, MenuItem, MenuList, MenuPopover, MenuTrigger, MessageBar, MessageBarActions, MessageBarBody, MessageBarGroup, MessageBarTitle, OverlayDrawer,
    Overflow, OverflowItem, Popover, PopoverSurface, Subtitle2, Tag, Toolbar, ToolbarButton, Tooltip, useIsOverflowItemVisible, useOverflowMenu, webLightTheme,
} from '@fluentui/react-components'
import {
    ArrowClockwiseRegular, ArrowLeftRegular, ArrowPreviousRegular, ArrowRightRegular, ArrowUndoRegular, CheckmarkRegular, ChevronDownRegular, ChevronUpRegular, ColumnEditRegular, CopyRegular,
    DeleteRegular, DismissRegular, SaveEditRegular, SaveRegular, SettingsRegular, DocumentSearchRegular, InfoRegular, MoreHorizontalRegular, PlugDisconnectedRegular, SearchRegular, TrophyRegular, WarningRegular,
} from '@fluentui/react-icons'
import { RecordDataGrid } from './RecordDataGrid'

//the parts name their icons the Fluent v8 way
const ICONS: { [iconName: string]: JSX.Element } = {
    Refresh: <ArrowClockwiseRegular />,
    DoubleChevronLeft: <ArrowPreviousRegular />,
    Back: <ArrowLeftRegular />,
    Forward: <ArrowRightRegular />,
    Undo: <ArrowUndoRegular />,
    Copy: <CopyRegular />,
    Clear: <DismissRegular />,
    Cancel: <DismissRegular />,
    Info: <InfoRegular />,
    Trophy2: <TrophyRegular />,
    PlugDisconnected: <PlugDisconnectedRegular />,
    Warning: <WarningRegular />,
    Save: <SaveRegular />,
    SaveAs: <SaveEditRegular />,
    Settings: <SettingsRegular />,
    Delete: <DeleteRegular />,
    ColumnOptions: <ColumnEditRegular />,
}

const toIcon = (iconProps?: IIconProps) => iconProps?.iconName ? ICONS[iconProps.iconName] ?? <Icon iconName={iconProps.iconName} /> : undefined

const withTooltip = (content: string | undefined, element: JSX.Element, key?: string) => content ? <Tooltip key={key} content={content} relationship='label'>{element}</Tooltip> : element

const OverflowMenuItem = (props: { item: ICommandBarItemProps }) => {
    const isVisible = useIsOverflowItemVisible(props.item.key)
    if (isVisible || !props.item.onClick) {
        return null
    }
    return <MenuItem icon={toIcon(props.item.iconProps)} disabled={props.item.disabled} onClick={event => props.item.onClick!(event as any, props.item)}>{props.item.text ?? props.item.title}</MenuItem>
}

//the commands that no longer fit, under a "more" button
const OverflowMenu = (props: { items: ICommandBarItemProps[] }) => {
    const { ref, isOverflowing } = useOverflowMenu<HTMLButtonElement>()
    if (!isOverflowing) {
        return null
    }
    return <Menu>
        <MenuTrigger disableButtonEnhancement>
            <ToolbarButton ref={ref} icon={<MoreHorizontalRegular />} aria-label='More commands' style={{ flexShrink: 0, minWidth: 32 }} />
        </MenuTrigger>
        <MenuPopover>
            <MenuList>{props.items.map(item => <OverflowMenuItem key={item.key} item={item} />)}</MenuList>
        </MenuPopover>
    </Menu>
}

const ToolbarItem = (props: { item: ICommandBarItemProps }) => {
    const { item } = props
    if (!item.onClick) {
        return <Caption1 style={{ padding: '0 8px', alignSelf: 'center' }}>{item.text}</Caption1>
    }
    const button = <ToolbarButton icon={toIcon(item.iconProps)} disabled={item.disabled} onClick={event => item.onClick!(event as any, item)}>{item.iconOnly ? undefined : item.text}</ToolbarButton>
    //an icon-only command names itself through its tooltip, as v8's command bar does
    return item.iconOnly ? <Tooltip content={item.title ?? item.text ?? ''} relationship='label'>{button}</Tooltip> : button
}

/** A v8 command bar's items as a v9 toolbar, overflowing into a menu as the command bar does; an item without a click is text. */
const CommandToolbar = (props: ICommandBarProps & { align?: 'start' | 'end', fixed?: boolean }) => {
    const items = [...props.items, ...props.farItems ?? []]
    if (items.length === 0) {
        return null
    }
    //a few commands in a box sized to its content, such as an error's, have nothing to overflow into
    if (props.fixed) {
        return <Toolbar size='small'>{items.map(item => <ToolbarItem key={item.key} item={item} />)}</Toolbar>
    }
    return <Overflow>
        <Toolbar size='small' className={props.className} style={{ width: '100%', minWidth: 0, overflow: 'hidden', flexWrap: 'nowrap', justifyContent: props.align === 'end' ? 'flex-end' : undefined }}>
            {items.map(item => <OverflowItem key={item.key} id={item.key}>
                <span style={{ flexShrink: 0, whiteSpace: 'nowrap' }}><ToolbarItem item={item} /></span>
            </OverflowItem>)}
            <OverflowMenu items={items} />
        </Toolbar>
    </Overflow>
}

//a header and the section after it make one group, which scrolls on its own
const renderMenuItems = (items: IContextualMenuItem[], selectedText?: string): React.ReactNode[] => items.map((item, index) => {
    switch (item.itemType) {
        case ContextualMenuItemType.Divider:
            return <MenuDivider key={item.key} />
        case ContextualMenuItemType.Header:
            return items[index + 1]?.itemType === ContextualMenuItemType.Section ? null : <MenuGroupHeader key={item.key}>{item.text}</MenuGroupHeader>
        case ContextualMenuItemType.Section: {
            const header = items[index - 1]?.itemType === ContextualMenuItemType.Header ? items[index - 1] : undefined
            return <MenuGroup key={item.key}>
                {header && <MenuGroupHeader>{header.text}</MenuGroupHeader>}
                <div style={{ maxHeight: 216, overflowY: 'auto' }}>{renderMenuItems(item.sectionProps?.items ?? [], selectedText)}</div>
            </MenuGroup>
        }
        default:
            return <MenuItem key={item.key} icon={item.checked || item.text === selectedText ? <CheckmarkRegular /> : toIcon(item.iconProps)} disabled={item.disabled} onClick={event => item.onClick?.(event as any, item)}>{item.text}</MenuItem>
    }
})

/** A button with a menu, such as the view switcher, as a Fluent v9 menu button. */
const MenuFromButton = (props: IButtonProps) => <Menu onOpenChange={(_, data) => data.open && props.onMenuClick?.(undefined as any, props)}>
    <MenuTrigger disableButtonEnhancement>
        <MenuButton appearance='subtle' disabled={props.disabled} title={props.title}>{props.text}</MenuButton>
    </MenuTrigger>
    <MenuPopover>
        <MenuList>{renderMenuItems(props.menuProps?.items ?? [], props.text)}</MenuList>
    </MenuPopover>
</Menu>

const getIntent = (messages: { level: string }[]) => messages.some(message => message.level === 'ERROR') ? 'error' : messages.some(message => message.level === 'WARNING') ? 'warning' : 'info'

//more than one message collapses under a summary, as the default bar does
const Notifications = (props: { messages?: { text: string, level: 'ERROR' | 'WARNING' | 'INFO' }[], labels?: { groupedNotificationsSummary?: string } }) => {
    const [isExpanded, setIsExpanded] = React.useState(false)
    const messages = props.messages ?? []
    if (messages.length === 0) {
        return null
    }
    if (messages.length === 1) {
        return <MessageBar intent={getIntent(messages)} style={{ margin: '0 8px 8px' }}><MessageBarBody>{messages[0].text}</MessageBarBody></MessageBar>
    }
    const summary = (props.labels?.groupedNotificationsSummary ?? 'You have {{ count }} notifications.').replace('{{ count }}', \`\${messages.length}\`)
    return <div style={{ margin: '0 8px 8px', display: 'grid', gap: 4 }}>
        <MessageBar intent={getIntent(messages)}>
            <MessageBarBody>{summary}</MessageBarBody>
            <MessageBarActions>
                <Button size='small' icon={isExpanded ? <ChevronUpRegular /> : <ChevronDownRegular />} onClick={() => setIsExpanded(!isExpanded)}>{isExpanded ? 'Hide' : 'Show'}</Button>
            </MessageBarActions>
        </MessageBar>
        {isExpanded && <MessageBarGroup style={{ display: 'grid', gap: 4 }}>
            {messages.map(message => <MessageBar key={message.text} intent={getIntent([message])}>
                <MessageBarBody>{message.text}</MessageBarBody>
            </MessageBar>)}
        </MessageBarGroup>}
    </div>
}

/** A v8 panel's props as a v9 drawer; \`fill\` lets what it holds take the whole body. */
const PanelDrawer = (props: IPanelProps & { children?: React.ReactNode, keepOpenOnEscape?: boolean, fill?: boolean }) => <OverlayDrawer open position='end' size='medium' onOpenChange={(_, data) => !data.open && !(props.keepOpenOnEscape && data.type === 'escapeKeyDown') && props.onDismiss?.()}>
    <DrawerHeader>
        <DrawerHeaderTitle action={<Button appearance='subtle' icon={<DismissRegular />} aria-label='Close' onClick={() => props.onDismiss?.()} />}>{props.headerText}</DrawerHeaderTitle>
    </DrawerHeader>
    <DrawerBody style={props.fill ? { display: 'flex', flexDirection: 'column', padding: 0 } : undefined}>{props.children}</DrawerBody>
    <DrawerFooter>{props.onRenderFooterContent?.()}</DrawerFooter>
</OverlayDrawer>

const errorMessage: Partial<IErrorMessageBarComponents> = {
    onRenderMessageBar: props => <MessageBar intent='error' style={{ margin: 8 }}>
        <MessageBarBody>{props.children}</MessageBarBody>
        <MessageBarActions>{props.actions}</MessageBarActions>
    </MessageBar>,
    onRenderTooltip: props => withTooltip(typeof props.content === 'string' ? props.content : undefined, <span>{props.children}</span>),
    onRenderTitle: props => <MessageBarTitle>{props.children}</MessageBarTitle>,
    onRenderCommandBar: props => <CommandToolbar {...props} fixed />,
}

/** The pieces of every part, drawn with Fluent UI v9. */
export const V9 = {
    control: {
        //the whole control in v9's theme; v9 copies the provider's class onto its popups, so the box is a div of its own
        onRenderContainer: props => <FluentProvider theme={webLightTheme} style={{ display: 'contents' }}>
            <div {...props} />
        </FluentProvider>,
        errorMessage,
    },
    viewSwitcher: {
        onRenderButton: props => <MenuFromButton {...props} />,
    },
    ribbon: {
        onRenderCommandBar: props => <CommandToolbar {...props} />,
        errorMessage,
    },
    quickFind: {
        onRenderTextField: (props: any) => <Input
            className={props.className}
            style={{ width: '100%' }}
            value={props.value}
            placeholder={props.placeholder}
            disabled={props.disabled}
            autoFocus={props.autoFocus}
            onClick={props.onClick}
            onBlur={props.onBlur}
            onKeyUp={props.onKeyUp}
            onChange={(event, data) => props.onChange?.(event, data.value)}
            contentAfter={<>
                {props.deleteButtonProps && <Button size='small' appearance='transparent' icon={<DismissRegular />} onClick={props.deleteButtonProps.onClick} />}
                <Button size='small' appearance='transparent' icon={<SearchRegular />} onClick={props.suffixItems?.[0]?.onClick} />
            </>} />,
        compact: {
            onRenderButton: props => withTooltip(props.text, <Button appearance='subtle' icon={<SearchRegular />} disabled={props.disabled} onClick={props.onClick as any} />),
        },
        callout: {
            //a v9 popover positioned on the field the quick find hands it
            onRenderCallout: props => <Popover open positioning={{ target: document.querySelector(props.target as string) as HTMLElement, position: 'below', align: 'start' }} onOpenChange={(_, data) => !data.open && props.onDismiss?.()}>
                <PopoverSurface style={{ maxWidth: 300, display: 'grid', gap: 8 }}>{props.children}</PopoverSurface>
            </Popover>,
            onRenderLikeWarning: props => <MessageBar intent='warning'><MessageBarBody>{props.text}</MessageBarBody></MessageBar>,
            onRenderDescription: props => <Caption1>{props.columnsHintStart} <b>{props.columnsHintOperator}</b> {props.columnsHintEnd}</Caption1>,
            onRenderColumns: props => <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{props.children}</div>,
            onRenderColumn: props => <Tag size='extra-small' appearance='brand' shape='circular'>{props.column.displayName}</Tag>,
        },
    },
    editColumns: {
        button: {
            onRenderButton: props => <Button appearance='subtle' icon={toIcon(props.iconProps)} aria-label={props.ariaLabel} disabled={props.disabled} onClick={props.onClick as any}>{props.text}</Button>,
            onRenderTooltip: props => withTooltip(typeof props.content === 'string' ? props.content : undefined, <span>{props.children}</span>),
        },
        panel: {
            //Escape would drop the edit without asking
            onRenderPanel: props => <PanelDrawer {...props} keepOpenOnEscape />,
            onRenderFooter: props => <>
                <Button appearance='primary' disabled={props.isSaveDisabled} onClick={props.onSave}>{props.saveText}</Button>
                <Button onClick={props.onCancel}>{props.cancelText}</Button>
            </>,
            onRenderCommandBar: props => <CommandToolbar {...props} />,
        },
        errorMessage,
    },
    notifications: {
        onRenderNotifications: props => <Notifications {...props} />,
    },
    emptyRecords: {
        onRenderIcon: () => <DocumentSearchRegular fontSize={48} />,
        onRenderText: props => <Subtitle2>{props.children}</Subtitle2>,
    },
    pagination: {
        onRenderCommandBar: props => <CommandToolbar {...props} align='end' />,
    },
    pageSizeSwitcher: {
        onRenderButton: props => <MenuFromButton {...props} />,
    },
    //the user queries' panel, and the control inside it, drawn the same way
    get userQueries() {
        return {
            manageViewsPanel: {
                onRenderPanel: (props: IPanelProps) => <PanelDrawer {...props} fill />,
                onRenderCloseButton: (props: IButtonProps) => <Button onClick={props.onClick as any}>{props.text}</Button>,
            },
            manageViews: {
                datasetControl: {
                    ...V9.control,
                    ribbon: V9.ribbon,
                    quickFind: V9.quickFind,
                    pagination: V9.pagination,
                    //the body's slot draws the views in v9's DataGrid, in place of the grid it is handed
                    body: { onRenderContainer: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}><RecordDataGrid editable /></div> },
                },
            },
        }
    },
}
`,
}

export const FluentV9Example = () => <GridExampleRunner seedCode={withFiles(FLUENT_V9_CODE, VIEWS_FILE, USER_VIEWS_FILE, DEALS_RIBBON_FILE, RECORD_DATA_GRID_FILE, V9_FILE)} />
