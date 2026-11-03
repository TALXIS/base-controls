/// <reference types="vite/client" />
import React from 'react'
import { initializeIcons, ITheme, mergeStyleSets, Text } from '@fluentui/react'
import { createClientSideRowModelModule, createEditingModule, createFilteringModule, createIsolatedComponent, createSortingModule, DatasetControl, Grid, IsolatedFrameScript, PcfContextProvider, StateProvider, ThemeProvider } from '@talxis/base-controls'
import { createDealsProvider } from '../grid/data'

declare global {
    interface Window {
        /** Set only in the frame, by the demo's `onPrepareWindow`. */
        isolatedFrameDemo?: { greeting: string }
    }
}

//a global rule only the frame should see
const FRAME_STYLES = `.ag-root-wrapper { border-top: 3px solid #5B5FC7 !important; }`

const styles = mergeStyleSets({
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

/** The deals in a DatasetControl, under a heading. */
export const DealsGrid = (props: IDealsGridProps) => {
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

/** DealsGrid in a frame of its own, declared once at module level so the frame finds it in its copy of the bundle. */
export const IsolatedDealsGrid = createIsolatedComponent('isolatedDealsGrid', FramedDealsGrid, { scripts: FRAME_SCRIPTS, onPrepareWindow: prepareFrameWindow })
