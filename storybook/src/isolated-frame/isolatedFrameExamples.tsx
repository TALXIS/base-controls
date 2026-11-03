/// <reference types="vite/client" />
import React from 'react'
import { initializeIcons, ITheme, mergeStyleSets, Text, useTheme } from '@fluentui/react'
import { createClientSideRowModelModule, createEditingModule, createFilteringModule, createIsolatedComponent, createSortingModule, DatasetControl, Grid, IsolatedFrameScript, PcfContextProvider, StateProvider, ThemeProvider } from '@talxis/base-controls'
import { createDealsProvider } from '../grid/data'

declare global {
    interface Window {
        /** Set only in the frame, by the demo's `onPrepareWindow`. */
        isolatedFrameDemo?: { greeting: string }
    }
}

//rules like an older AG Grid's on the same page
const OTHER_APP_STYLES = `
.ag-header-cell * { color: #e3008c !important; text-transform: uppercase; }
.ag-cell * { font-family: 'Courier New', monospace !important; }
.ag-row { border-bottom: 2px dashed #e3008c !important; }
`

//a global rule only the frame should see
const FRAME_STYLES = `.ag-root-wrapper { border-top: 3px solid #5B5FC7 !important; }`

const styles = mergeStyleSets({
    showcase: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: 16,
    },
    frame: {
        height: 460,
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        height: '100%',
        padding: 12,
        boxSizing: 'border-box',
    },
    grid: {
        flex: 1,
        minHeight: 0,
    },
})

const modules = [createClientSideRowModelModule(), createEditingModule(), createSortingModule(), createFilteringModule()]

interface IDealsGridProps {
    heading: string
}

const DealsGrid = (props: IDealsGridProps) => {
    const deals = React.useMemo(createDealsProvider, [])
    const greeting = window.isolatedFrameDemo?.greeting

    React.useEffect(() => {
        if (!greeting) {
            return
        }
        const style = document.createElement('style')
        style.textContent = FRAME_STYLES
        document.head.appendChild(style)
        return () => style.remove()
    }, [greeting])

    return <div className={styles.content}>
        <Text variant='mediumPlus' block>{props.heading}{greeting && ` · ${greeting}`}</Text>
        <div className={styles.grid}>
            <DatasetControl height='100%' onLoad={async () => ({ provider: deals })}>
                <DatasetControl.Body>
                    <Grid modules={modules} />
                </DatasetControl.Body>
            </DatasetControl>
        </div>
    </div>
}

interface IFramedDealsGridProps extends IDealsGridProps {
    theme: ITheme
}

let areFrameIconsRegistered = false

//no provider or icon of the page reaches the frame
const FramedDealsGrid = (props: IFramedDealsGridProps) => {
    if (!areFrameIconsRegistered) {
        initializeIcons()
        areFrameIconsRegistered = true
    }

    return <PcfContextProvider>
        <StateProvider>
            <ThemeProvider theme={props.theme} style={{ height: '100%' }}>
                <DealsGrid heading={props.heading} />
            </ThemeProvider>
        </StateProvider>
    </PcfContextProvider>
}

//a build emits the entry under a fixed name
const FRAME_SCRIPTS: IsolatedFrameScript[] = [{
    src: import.meta.env.DEV ? import.meta.url.replace(/[^/]*$/, 'frameEntry.ts') : `${import.meta.env.BASE_URL}isolated-frame-entry.js`,
    type: 'module',
}]

const prepareFrameWindow = (frameWindow: Window) => {
    frameWindow.isolatedFrameDemo = { greeting: 'handed over by onPrepareWindow' }
}

export const IsolatedDealsGrid = createIsolatedComponent('isolatedDealsGrid', FramedDealsGrid, { scripts: FRAME_SCRIPTS, onPrepareWindow: prepareFrameWindow })

export const IsolationShowcase = () => {
    const theme = useTheme()

    React.useEffect(() => {
        const style = document.createElement('style')
        style.textContent = OTHER_APP_STYLES
        document.head.appendChild(style)
        return () => style.remove()
    }, [])

    return <div className={styles.showcase}>
        <div className={styles.frame}>
            <DealsGrid heading='In the page' />
        </div>
        <div className={styles.frame}>
            <IsolatedDealsGrid heading='In a frame' theme={theme} frame={{ title: 'Deals' }} />
        </div>
    </div>
}
