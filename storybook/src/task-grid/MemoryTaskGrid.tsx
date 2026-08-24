import React from 'react'
import { initializeIcons } from '@fluentui/react'
import { TaskGrid } from '@talxis/base-controls'
import type { ITaskGridProps } from '@talxis/base-controls'
import { createMemoryTaskGridDescriptor } from './memoryDescriptor'
import type { MemoryTaskGridModuleName } from './memoryDescriptor'

//the TaskGrid renders Fluent icons but, unlike Form, nothing in its tree registers them
initializeIcons()

/**
 * Everything `<TaskGrid />` takes except the two the harness supplies itself — so a story can pass
 * component overrides, labels, or any of the event props — plus which feature modules to register.
 */
type IMemoryTaskGridProps = Omit<ITaskGridProps, 'taskGridDescriptor'> & {
    /** Which modules the descriptor registers. Omit for the usual documentation set. */
    modules?: MemoryTaskGridModuleName[];
}

/**
 * The live Task Grid used across the documentation pages, backed by the in-memory strategy.
 * Every page embeds this same component so the docs always show a working grid.
 */
export const MemoryTaskGrid = ({ modules, ...props }: IMemoryTaskGridProps) => {
    //one descriptor per mount - it owns the in-memory task state for the session
    const descriptor = React.useMemo(() => createMemoryTaskGridDescriptor({ modules }), [])
    return <TaskGrid {...props} taskGridDescriptor={descriptor} />
}
