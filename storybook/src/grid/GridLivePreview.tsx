import * as Babel from '@babel/standalone'
import React from 'react'
import type { IDataProvider } from '@talxis/client-libraries'
import { GRID_SANDBOX_SCOPE } from './gridSandboxScope'

interface IGridLivePreviewProps {
    code: string
    /** Injected so an edit keeps the rows, and whatever the reader did to them. */
    provider: IDataProvider
    /** Handed to `GridExample` as its props. */
    previewProps?: object
    onError?: (error: string | null) => void
}

const SCOPE_NAMES = [...Object.keys(GRID_SANDBOX_SCOPE), 'provider']

/** Compiles the edited snippet and renders whatever `GridExample` it defines. */
export const GridLivePreview = (props: IGridLivePreviewProps) => {
    const compiled = React.useMemo(() => {
        try {
            const transformed = Babel.transform(props.code, {
                presets: [
                    ['typescript', { allExtensions: true, isTSX: true }],
                    ['react', { runtime: 'classic' }],
                ],
                filename: 'grid-snippet.tsx',
            })?.code ?? ''
            const factory = new Function(...SCOPE_NAMES, `${transformed}
                return typeof GridExample !== "undefined" ? GridExample : null;`)
            const Component = factory(...Object.values(GRID_SANDBOX_SCOPE), props.provider) as React.ComponentType<any> | null
            return { Component, error: null as string | null }
        } catch (error) {
            return { Component: null, error: (error as Error).message }
        }
    }, [props.code])

    React.useEffect(() => {
        props.onError?.(compiled.error)
    }, [compiled.error])

    if (compiled.error) {
        return <pre>{compiled.error}</pre>
    }
    if (!compiled.Component) {
        return <div>The code window must define a <code>GridExample</code>.</div>
    }
    const PreviewComponent = compiled.Component
    //keyed by the code: an edit remounts the grid
    return <GridPreviewBoundary key={props.code}>
        <PreviewComponent {...props.previewProps} />
    </GridPreviewBoundary>
}

interface IGridPreviewBoundaryProps {
    children: React.ReactNode
}

interface IGridPreviewBoundaryState {
    error: string | null
}

class GridPreviewBoundary extends React.Component<IGridPreviewBoundaryProps, IGridPreviewBoundaryState> {
    public readonly state: IGridPreviewBoundaryState = { error: null }

    public static getDerivedStateFromError(error: Error): IGridPreviewBoundaryState {
        return { error: error.message }
    }

    public render(): React.ReactNode {
        if (this.state.error) {
            return <pre>{this.state.error}</pre>
        }
        return this.props.children
    }
}
