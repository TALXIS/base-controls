import * as Babel from '@babel/standalone'
import React from 'react'
import { CheckList } from '@talxis/base-controls'
import type { IColumn, IRawRecord } from '@talxis/client-libraries'
import type { ICheckListFieldMapping } from '@talxis/base-controls'

interface ICheckListLivePreviewProps {
    code: string
    /**
     * Injected rather than created by the snippet: the rows are the example's state, so rebuilding them
     * on every edit would throw away whatever the reader just did to the list.
     */
    rows: IRawRecord[]
    columns: IColumn[]
    fieldMapping: ICheckListFieldMapping
    /** Called with every set of items the checklist reports, so the runner's `rows` stay current. */
    onDataChanged: (items: IRawRecord[]) => void
    onError?: (error: string | null) => void
}

/** Compiles the edited snippet and renders whatever `CheckListExample` it defines. */
export const CheckListLivePreview = (props: ICheckListLivePreviewProps) => {
    const compiled = React.useMemo(() => {
        try {
            const transformed = Babel.transform(props.code, {
                presets: [
                    ['typescript', { allExtensions: true, isTSX: true }],
                    ['react', { runtime: 'classic' }],
                ],
                filename: 'check-list-snippet.tsx',
            })?.code ?? ''

            const factory = new Function(
                'React',
                'CheckList',
                'rows',
                'columns',
                'fieldMapping',
                `${transformed}
                 return typeof CheckListExample !== "undefined" ? CheckListExample : null;`,
            )

            //the snippet's own event props still run: the runner layers its bookkeeping on top rather
            //than taking the prop over, so an edited `onDataChanged` behaves as the reader wrote it
            const SandboxCheckList = (checkListProps: any) => <CheckList
                {...checkListProps}
                onDataChanged={(items: IRawRecord[]) => {
                    props.onDataChanged(items)
                    checkListProps.onDataChanged?.(items)
                }} />

            const Component = factory(
                React,
                SandboxCheckList,
                props.rows,
                props.columns,
                props.fieldMapping,
            ) as React.ComponentType | null

            return { Component, error: null as string | null }
        } catch (error) {
            return { Component: null, error: (error as Error).message }
        }
        //the data is stable for the life of the story, so the code is the only trigger
    }, [props.code])

    React.useEffect(() => {
        props.onError?.(compiled.error)
    }, [compiled.error])

    if (compiled.error) {
        return <pre>{compiled.error}</pre>
    }

    if (!compiled.Component) {
        return <div>The code window must define a <code>CheckListExample</code>.</div>
    }

    const PreviewComponent = compiled.Component

    return <CheckListPreviewBoundary key={props.code}>
        <PreviewComponent />
    </CheckListPreviewBoundary>
}

interface ICheckListPreviewBoundaryProps {
    children: React.ReactNode
}

interface ICheckListPreviewBoundaryState {
    error: string | null
}

class CheckListPreviewBoundary extends React.Component<ICheckListPreviewBoundaryProps, ICheckListPreviewBoundaryState> {
    public readonly state: ICheckListPreviewBoundaryState = {
        error: null,
    }

    public static getDerivedStateFromError(error: Error): ICheckListPreviewBoundaryState {
        return {
            error: error.message,
        }
    }

    public render(): React.ReactNode {
        if (this.state.error) {
            return <pre>{this.state.error}</pre>
        }

        return this.props.children
    }
}
