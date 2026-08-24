import React from 'react'
import { initializeIcons, Stack, Text } from '@fluentui/react'
import { TaskGrid } from '@talxis/base-controls'
import { createMemoryTaskGridDescriptor } from '../memoryDescriptor'
import { generateTasks } from './generateTasks'

//the TaskGrid renders Fluent icons but, unlike Form, nothing in its tree registers them
initializeIcons()

export interface ILargeTaskGridProps {
    /** How many task records to generate. */
    count: number;
    /** Fixed by default, so two runs of this story measure the same dataset. */
    seed?: number;
}

/**
 * The memory Task Grid over a generated dataset, for measuring how the grid behaves at a size no
 * hand-written fixture can reach.
 *
 * Generation is deliberately inside `onInitialize`: the grid awaits it behind its own loading state, so
 * the reported time is the dataset's, not the grid's. Everything else — views, columns, templates,
 * lookup pickers — is the same descriptor the documentation stories use.
 */
export const LargeTaskGrid = (props: ILargeTaskGridProps) => {
    const { count, seed } = props
    const [generatedInMs, setGeneratedInMs] = React.useState<number>()

    const descriptor = React.useMemo(() => createMemoryTaskGridDescriptor({
        //fills whatever the story gives it, so a big dataset is measured at full viewport height
        height: '100%',
        onGetRecords: async () => {
            const startedAt = performance.now()
            const records = generateTasks({ count, seed })
            setGeneratedInMs(performance.now() - startedAt)
            return records
        },
    }), [count, seed])

    return (
        <Stack tokens={{ childrenGap: 8 }} styles={{ root: { height: '100%' } }}>
            <Text variant="small">
                {count.toLocaleString()} generated tasks
                {generatedInMs !== undefined && ` · built in ${Math.round(generatedInMs)} ms`}
                {seed !== undefined && ` · seed ${seed}`}
            </Text>
            <TaskGrid descriptor={descriptor} />
        </Stack>
    )
}
