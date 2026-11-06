import React from 'react'
import { GridExampleRunner } from '../grid/GridExampleRunner'
import type { IGridExampleFile } from '../grid/GridLivePreview'

const ISOLATION_FILES: IGridExampleFile[] = [
    {
        name: 'GridExample.tsx',
        code: `import { createIsolatedHost, ITheme, useTheme } from '@talxis/base-controls'
import { Stack } from '@fluentui/react'
import { DealsGrid } from './deals'

//another app's global CSS on the same page: it restyles every AG Grid it reaches
const OTHER_APP_STYLES = \`
.ag-header-cell * { color: #e3008c !important; text-transform: uppercase; }
.ag-cell * { font-family: 'Courier New', monospace !important; }
.ag-row { border-bottom: 2px dashed #e3008c !important; }
\`

//the page names the key, the props and the frame's scripts, never FramedDeals
const IsolatedDeals = createIsolatedHost<{ theme: ITheme }>('deals', {
    //your frame's entry script; here, the docs runner that runs these files
    scripts: SANDBOX_FRAME_SCRIPTS,
    //runs on the frame's window before its scripts load
    onPrepareWindow: frameWindow => Object.assign(frameWindow, { greeting: 'handed over by onPrepareWindow' }),
})

const GridExample = () => {
    const theme = useTheme()

    React.useEffect(() => {
        const style = document.createElement('style')
        style.textContent = OTHER_APP_STYLES
        document.head.appendChild(style)
        return () => style.remove()
    }, [])

    return <Stack horizontal tokens={{ childrenGap: 16 }} styles={{ root: { height: 640 } }}>
        <Stack.Item grow styles={{ root: { flexBasis: 0, minWidth: 0 } }}>
            <DealsGrid heading='In the page' />
        </Stack.Item>
        <Stack.Item grow styles={{ root: { flexBasis: 0, minWidth: 0 } }}>
            {/* frame sets up the iframe; every other prop goes to the content */}
            <IsolatedDeals theme={theme} frame={{ title: 'Deals' }} />
        </Stack.Item>
    </Stack>
}
`,
    },
    {
        name: 'FramedDeals.tsx',
        code: `import { AppThemeProvider, ITheme, PcfContextProvider, registerIsolatedContent, StateProvider } from '@talxis/base-controls'
import { initializeIcons } from '@fluentui/react'
import { DealsGrid } from './deals'

//the frame's entry: only the frame runs this file

//the frame starts with no icons registered
initializeIcons()

//the frame starts empty, so the content brings its own providers
const FramedDeals = (props: { theme: ITheme }) => {
    const { greeting } = window as Window & { greeting?: string }
    return <PcfContextProvider>
        <StateProvider>
            <AppThemeProvider theme={props.theme} style={{ height: '100%' }}>
                <DealsGrid heading={\`In a frame · \${greeting}\`} />
            </AppThemeProvider>
        </StateProvider>
    </PcfContextProvider>
}

//under the key the page's host names
registerIsolatedContent('deals', FramedDeals)
`,
    },
    {
        name: 'deals.tsx',
        code: `import { createClientSideRowModelModule, createSortingModule, DatasetControl, Grid } from '@talxis/base-controls'
import { DataTypes, MemoryDataProvider } from '@talxis/client-libraries'
import { Stack, Text } from '@fluentui/react'

//used by both sides: the page and the frame each run their own copy
const createDeals = () => new MemoryDataProvider({
    dataSource: [
        { dealid: 'contoso', name: 'Contoso: CRM rollout', owner: 'Anna Novak', value: 4000 },
        { dealid: 'fabrikam', name: 'Fabrikam: Support renewal', owner: 'Ben Carter', value: 21500 },
        { dealid: 'northwind', name: 'Northwind: Data migration', owner: 'Anna Novak', value: 9000 },
        { dealid: 'litware', name: 'Litware: Onboarding', owner: 'Ben Carter', value: 14000 },
    ],
    metadata: { PrimaryIdAttribute: 'dealid', PrimaryNameAttribute: 'name', LogicalName: 'deal' },
    columns: [
        { name: 'name', displayName: 'Deal', dataType: DataTypes.SingleLineText, visualSizeFactor: 220 },
        { name: 'owner', displayName: 'Account manager', dataType: DataTypes.SingleLineText, visualSizeFactor: 160 },
        { name: 'value', displayName: 'Value', dataType: DataTypes.Currency, visualSizeFactor: 120 },
    ],
})

export const DealsGrid = (props: { heading: string }) => <Stack tokens={{ childrenGap: 8 }} styles={{ root: { padding: 12 } }}>
    <Text variant='mediumPlus'>{props.heading}</Text>
    <DatasetControl onLoad={async () => ({ provider: createDeals() })} height='560px'>
        <DatasetControl.Header>
            <DatasetControl.Header.End>
                {/* its panel opens in the window it was rendered in */}
                <DatasetControl.EditColumns />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <Grid modules={[createClientSideRowModelModule(), createSortingModule()]} />
        </DatasetControl.Body>
    </DatasetControl>
</Stack>
`,
    },
]

export const IsolationExample = () => <GridExampleRunner seedCode={ISOLATION_FILES} tabs={['preview', 'code']} />
