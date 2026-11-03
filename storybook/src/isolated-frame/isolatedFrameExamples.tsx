import React from 'react'
import { GridExampleRunner } from '../grid/GridExampleRunner'

const ISOLATION_CODE = `//another app's global CSS on the same page: it restyles every AG Grid it reaches
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
            {/* declared in the bundle: createIsolatedComponent('isolatedDealsGrid', FramedDealsGrid, { onPrepareWindow }) */}
            {/* props cross into the frame on every render, the page's theme included */}
            <IsolatedDealsGrid heading='In a frame' theme={theme} frame={{ title: 'Deals' }} />
        </Stack.Item>
    </Stack>
}
`

export const IsolationExample = () => <GridExampleRunner seedCode={ISOLATION_CODE} />
