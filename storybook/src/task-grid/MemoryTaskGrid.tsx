import React from 'react'
import { initializeIcons } from '@fluentui/react'
import { TaskGrid } from '@talxis/base-controls/components/TaskGrid'
import type { ITaskGridComponents } from '@talxis/base-controls/components/TaskGrid'
import { usePcfContext } from '@talxis/base-controls/utils'
import { createMemoryTaskGridDescriptor } from './memoryDescriptor'

//the TaskGrid renders Fluent icons but, unlike Form, nothing in its tree registers them
initializeIcons()

interface IMemoryTaskGridProps {
    /** Component overrides forwarded to the grid. Pass a stable object — it is merged on every render. */
    components?: Partial<ITaskGridComponents>
}

/**
 * The live Task Grid used across the documentation pages, backed by the in-memory strategy.
 * Every page embeds this same component so the docs always show a working grid.
 */
export const MemoryTaskGrid = (props: IMemoryTaskGridProps) => {
    const pcfContext = usePcfContext()
    //one descriptor per mount - it owns the in-memory task state for the session
    const descriptor = React.useMemo(() => createMemoryTaskGridDescriptor(), [])
    return <TaskGrid pcfContext={pcfContext} taskGridDescriptor={descriptor} components={props.components} />
}
