import React from 'react'
import { GridExampleRunner } from '../grid/GridExampleRunner'
import type { IGridExampleFile } from '../grid/GridLivePreview'

const ISOLATION_FILES: IGridExampleFile[] = [
    {
        name: 'GridExample.tsx',
        code: `import { IsolatedDeals } from './IsolatedDeals'

//another app's global CSS on the same page: it restyles every AG Grid it reaches
const OTHER_APP_STYLES = \`
.ag-header-cell * { color: #e3008c !important; text-transform: uppercase; }
.ag-cell * { font-family: 'Courier New', monospace !important; }
.ag-row { border-bottom: 2px dashed #e3008c !important; }
\`

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
            {/* props cross into the frame on every render, the page's theme included */}
            <IsolatedDeals theme={theme} frame={{ title: 'Deals' }} />
        </Stack.Item>
    </Stack>
}
`,
    },
    {
        name: 'IsolatedDeals.tsx',
        code: `//a global rule of the framed grid's own: it stays inside its frame
const FRAME_STYLES = \`.ag-root-wrapper { border-top: 3px solid #5B5FC7 !important; }\`

let areIconsRegistered = false

//what runs in the frame, which starts empty: it brings its own icons, providers and theme
const FramedDeals = (props: { theme: ITheme }) => {
    if (!areIconsRegistered) {
        initializeIcons()
        areIconsRegistered = true
    }

    React.useEffect(() => {
        const style = document.createElement('style')
        style.textContent = FRAME_STYLES
        document.head.appendChild(style)
        return () => style.remove()
    }, [])

    const { greeting } = window as Window & { greeting?: string }
    return <PcfContextProvider>
        <StateProvider>
            <ThemeProvider theme={props.theme} style={{ height: '100%' }}>
                <DealsGrid heading={\`In a frame · \${greeting}\`} />
            </ThemeProvider>
        </StateProvider>
    </PcfContextProvider>
}

//declared once at module level, so the frame finds it by its key in its own copy of the code
export const IsolatedDeals = createIsolatedComponent('deals', FramedDeals, {
    //in your app, the script of your bundle; here, the docs' bundle and this example
    scripts: SANDBOX_FRAME_SCRIPTS,
    //runs on the frame's window before its scripts load
    onPrepareWindow: frameWindow => Object.assign(frameWindow, { greeting: 'handed over by onPrepareWindow' }),
})
`,
    },
]

export const IsolationExample = () => <GridExampleRunner seedCode={ISOLATION_FILES} />
