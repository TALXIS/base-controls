import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'

const YOUR_OWN_PIECES_CODE = `import { loadDeals } from './views'

const copyLink = async (viewId: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('view', viewId)
    await navigator.clipboard.writeText(url.toString())
}

//menu items and commands go through the parts, not slots
const addCommands = (control: IDatasetControl) => {
    control.parts.observe('viewSwitcher', viewSwitcher => viewSwitcher.registerItems(items => {
        items.push(
            { key: 'copyLinkDivider', itemType: ContextualMenuItemType.Divider },
            { key: 'copyLink', text: 'Copy a link to this view', iconProps: { iconName: 'Link' }, onClick: () => { copyLink(control.getViewId()!) } },
        )
    }))
    control.parts.observe('editColumns', editColumns => editColumns.registerColumnCommands((commands, column, session) => {
        //the draggable column list runs commands on mouse up
        commands.push({ key: 'moveToTop', iconProps: { iconName: 'Up' }, title: 'Move to the top', onMouseUp: () => session.moveColumn(column.name, session.getColumns()[0].name) })
    }))
}

const GridExample = () => <DatasetControl stateKey='yourOwnPieces' onLoad={loadDeals} onSetup={addCommands} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher components={{
                onRenderButton: props => <TooltipHost content='Switch between views of the deals'>{ViewSwitcherUiComponents.onRenderButton(props)}</TooltipHost>,
            }} />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DatasetControl.EditColumns />
            <DatasetControl.QuickFind components={{ callout: { onRenderColumn: ({ column }) => <Text>{column.displayName} ({column.name})</Text> } }} />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={[createClientSideRowModelModule()]} />
    </DatasetControl.Body>
</DatasetControl>
`

export const YourOwnPiecesExample = () => <GridExampleRunner seedCode={withFiles(YOUR_OWN_PIECES_CODE, VIEWS_FILE)} tabs={['preview', 'code']} />
