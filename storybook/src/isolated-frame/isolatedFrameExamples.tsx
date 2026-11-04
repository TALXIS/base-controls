import React from 'react'
import { GridExampleRunner } from '../grid/GridExampleRunner'
import type { IGridExampleFile } from '../grid/GridLivePreview'

const ISOLATION_FILES: IGridExampleFile[] = [
    {
        name: 'GridExample.tsx',
        code: `import { DealsGrid } from './deals'

//another app's global CSS on the same page: it restyles every AG Grid it reaches
const OTHER_APP_STYLES = \`
.ag-header-cell * { color: #e3008c !important; text-transform: uppercase; }
.ag-cell * { font-family: 'Courier New', monospace !important; }
.ag-row { border-bottom: 2px dashed #e3008c !important; }
\`

//the page knows only the key, the props and where the frame's code is: it never imports FramedDeals
const IsolatedDeals = createIsolatedHost<{ theme: ITheme }>('deals', {
    //in your app, the frame's entry script; here, the docs' runner, which runs these files
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

    return <Stack horizontal tokens={{ childrenGap: 16 }} styles={{ root: { height: 460 } }}>
        <Stack.Item grow styles={{ root: { flexBasis: 0, minWidth: 0 } }}>
            <DealsGrid heading='In the page' />
        </Stack.Item>
        <Stack.Item grow styles={{ root: { flexBasis: 0, minWidth: 0 } }}>
            {/* frame goes to the iframe; every other prop crosses into the frame on every render */}
            <IsolatedDeals theme={theme} frame={{ title: 'Deals' }} />
        </Stack.Item>
    </Stack>
}
`,
    },
    {
        name: 'FramedDeals.tsx',
        code: `import { DealsGrid } from './deals'

//the frame's own entry: only the frame runs this file, so the page's bundle never holds it

//the frame starts empty: it registers its own icons, and the content brings its providers and theme
initializeIcons()

//a props type shared with the page can be a type-only import, which leaves no code in either bundle
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
        code: `//used by both sides: the page and the frame each run their own copy
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
    <DatasetControl onLoad={async () => ({ provider: createDeals() })} height='380px'>
        <DatasetControl.Body>
            <Grid modules={[createClientSideRowModelModule(), createSortingModule()]} />
        </DatasetControl.Body>
    </DatasetControl>
</Stack>
`,
    },
]

export const IsolationExample = () => <GridExampleRunner seedCode={ISOLATION_FILES} />
