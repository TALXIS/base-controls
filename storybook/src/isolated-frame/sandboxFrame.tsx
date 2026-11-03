/// <reference types="vite/client" />
import React from 'react'
import { mergeStyleSets, Text } from '@fluentui/react'
import { createClientSideRowModelModule, createEditingModule, createFilteringModule, createSortingModule, DatasetControl, Grid, IsolatedFrameScript } from '@talxis/base-controls'
import { createDealsProvider } from '../grid/data'
import type { IGridExampleFile } from '../grid/GridLivePreview'

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

/** The deals in a DatasetControl, under a heading. */
export const DealsGrid = (props: { heading: string }) => {
    const deals = React.useMemo(createDealsProvider, [])
    return <div className={styles.content}>
        <Text variant='mediumPlus' block>{props.heading}</Text>
        <div className={styles.grid}>
            <DatasetControl height='100%' onLoad={async () => ({ provider: deals })}>
                <DatasetControl.Body>
                    <Grid modules={modules} />
                </DatasetControl.Body>
            </DatasetControl>
        </div>
    </div>
}

//a build emits the entry under a fixed name
const FRAME_ENTRY: IsolatedFrameScript = {
    src: import.meta.env.DEV ? import.meta.url.replace(/[^/]*$/, 'frameEntry.ts') : `${import.meta.env.BASE_URL}isolated-frame-entry.js`,
    type: 'module',
}

/** What a frame loads to run a live example: the docs' bundle, then the example's own files. */
export const createSandboxFrameScripts = (files: IGridExampleFile[]): IsolatedFrameScript[] => {
    const run = new Blob([`window.__runSandboxFiles(${JSON.stringify(files)})`], { type: 'text/javascript' })
    return [FRAME_ENTRY, { src: URL.createObjectURL(run), type: 'module' }]
}
