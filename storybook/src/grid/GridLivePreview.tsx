import * as Babel from '@babel/standalone'
import React from 'react'
import type { IDataProvider } from '@talxis/client-libraries'
import { Grid, IGrid } from '@talxis/base-controls'
import { GRID_SANDBOX_SCOPE } from './gridSandboxScope'

const SCOPE_NAMES = [...Object.keys(GRID_SANDBOX_SCOPE), 'provider']

type ISandboxScope = typeof GRID_SANDBOX_SCOPE

//the snippet's own Grid.Root tells the runner which provider it draws
const createScope = (onProviderRendered: (provider: IDataProvider) => void): ISandboxScope => {
    const Root = (props: IGrid) => {
        React.useEffect(() => onProviderRendered(props.provider), [props.provider])
        return <Grid.Root {...props} />
    }
    return { ...GRID_SANDBOX_SCOPE, Grid: { ...Grid, Root: Root as typeof Grid.Root } }
}

interface ICompiledGridExample {
    Component: React.ComponentType<any> | null
    error: string | null
}

const transpile = (code: string) => Babel.transform(code, {
    presets: [
        ['typescript', { allExtensions: true, isTSX: true }],
        ['react', { runtime: 'classic' }],
    ],
    filename: 'grid-snippet.tsx',
})?.code ?? ''

/** Why a snippet does not compile, or `null` when it does. */
export const getGridExampleSyntaxError = (code: string): string | null => {
    try {
        transpile(code)
        return null
    } catch (error) {
        return (error as Error).message
    }
}

const compileGridExample = (code: string, scope: ISandboxScope, provider: IDataProvider): ICompiledGridExample => {
    try {
        const transformed = transpile(code)
        const factory = new Function(...SCOPE_NAMES, `${transformed}
            return typeof GridExample !== "undefined" ? GridExample : null;`)
        const Component = factory(...Object.values(scope), provider) as React.ComponentType<any> | null
        return { Component, error: Component ? null : 'The code must define a GridExample component.' }
    } catch (error) {
        return { Component: null, error: (error as Error).message }
    }
}

interface IGridLivePreviewProps {
    code: string
    /** Injected so an edit keeps the rows, and whatever the reader did to them. */
    provider: IDataProvider
    /** Handed to `GridExample` as its props. */
    previewProps?: object
    onError?: (error: string | null) => void
    /** Called with the provider the snippet's grid draws, which may be one the snippet built itself. */
    onProviderRendered?: (provider: IDataProvider) => void
}

/** Compiles the edited snippet and renders whatever `GridExample` it defines. */
export const GridLivePreview = (props: IGridLivePreviewProps) => {
    const onProviderRenderedRef = React.useRef(props.onProviderRendered)
    onProviderRenderedRef.current = props.onProviderRendered
    const scope = React.useMemo(() => createScope(provider => onProviderRenderedRef.current?.(provider)), [])
    const compiled = React.useMemo(() => compileGridExample(props.code, scope, props.provider), [props.code])

    React.useEffect(() => {
        props.onError?.(compiled.error)
    }, [compiled.error])

    if (!compiled.Component) {
        return <pre>{compiled.error}</pre>
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
