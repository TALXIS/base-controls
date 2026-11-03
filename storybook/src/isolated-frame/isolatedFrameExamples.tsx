import React from 'react'
import { GridExampleRunner } from '../grid/GridExampleRunner'
import type { IGridExampleFile } from '../grid/GridLivePreview'

const ISOLATION_FILES: IGridExampleFile[] = [
    {
        name: 'GridExample.tsx',
        code: `//another app's global CSS on the same page: it restyles every AG Grid it reaches
const OTHER_APP_STYLES = \`
.ag-header-cell * { color: #e3008c !important; text-transform: uppercase; }
.ag-cell * { font-family: 'Courier New', monospace !important; }
.ag-row { border-bottom: 2px dashed #e3008c !important; }
\`

//the page knows only the key, the props and where the frame's code is: it never imports FramedDeals
const IsolatedDeals = createIsolatedHost<{ theme: ITheme }>('deals', {
    //in your app, the frame's own entry; here, the docs' bundle and FramedDeals.tsx
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
        code: `//the frame's own entry: only the frame runs this file, so the page's bundle never holds it

//the frame starts empty: it registers its own icons, and the content brings its providers and application theme
initializeIcons()

//a props type shared with the page can be a type-only import, which leaves no code in either bundle
const FramedDeals = (props: { theme: ITheme }) => {
    const { greeting } = window as Window & { greeting?: string }
    return <PcfContextProvider>
        <StateProvider>
            <ApplicationThemeProvider theme={props.theme} style={{ height: '100%' }}>
                <DealsGrid heading={\`In a frame · \${greeting}\`} />
            </ApplicationThemeProvider>
        </StateProvider>
    </PcfContextProvider>
}

//under the key the page's host names
registerIsolatedContent('deals', FramedDeals)
`,
    },
]

export const IsolationExample = () => <GridExampleRunner seedCode={ISOLATION_FILES} />
