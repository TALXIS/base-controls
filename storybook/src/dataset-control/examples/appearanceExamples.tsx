import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'

const YOUR_OWN_PIECES_CODE = `import { loadDeals } from './views'

const GridExample = () => <DatasetControl onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            {/* wraps the default button */}
            <DatasetControl.ViewSwitcher components={{
                onRenderButton: props => <TooltipHost content='Switch between views of the deals'>{DatasetControlUiViewSwitcherComponents.onRenderButton(props)}</TooltipHost>,
            }} />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            {/* replaces how the callout draws each column it searches */}
            <DatasetControl.QuickFind components={{ callout: { onRenderColumn: ({ column }) => <Text>{column.displayName} ({column.name})</Text> } }} />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid />
    </DatasetControl.Body>
</DatasetControl>
`

export const YourOwnPiecesExample = () => <GridExampleRunner seedCode={withFiles(YOUR_OWN_PIECES_CODE, VIEWS_FILE)} tabs={['preview', 'code']} />
