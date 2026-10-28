import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'

const YOUR_OWN_PIECES_CODE = `import { loadDeals, loadDealViews } from './views'

//the default button, with a command added under the views
const ViewSwitcherWithLink = (props: IButtonProps) => ViewSwitcherUiComponents.onRenderButton({
    ...props,
    menuProps: {
        ...props.menuProps!,
        items: [...props.menuProps!.items, { key: 'divider', itemType: ContextualMenuItemType.Divider }, { key: 'copyLink', text: 'Copy a link to this view', iconProps: { iconName: 'Link' } }],
    },
})

const GridExample = () => <DatasetControl onLoadViews={loadDealViews} stateKey='deals' onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher components={{ onRenderButton: props => <ViewSwitcherWithLink {...props} /> }} />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DatasetControl.EditColumns components={{
                columnList: {
                    onRenderColumn: props => <DatasetControl.Ui.EditColumnsColumn {...props} commands={[{ key: 'info', iconProps: { iconName: 'Info' }, title: props.column.name }, ...props.commands]} />,
                },
            }} />
            <DatasetControl.QuickFind components={{ callout: { onRenderColumn: ({ column }) => <Text>{column.displayName} ({column.name})</Text> } }} />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={[createClientSideRowModelModule()]} />
    </DatasetControl.Body>
</DatasetControl>
`

export const YourOwnPiecesExample = () => <GridExampleRunner seedCode={withFiles(YOUR_OWN_PIECES_CODE, VIEWS_FILE)} />
