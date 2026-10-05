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

/** One file of a live example; the first is the one that defines `GridExample`. */
export interface IGridExampleFile {
    name: string
    code: string
}

interface ICompiledGridExample {
    Component: React.ComponentType<any> | null
    error: string | null
}

interface ISnippetModule {
    exports: { [name: string]: any }
    //set by a file that declares `GridExample` without exporting it
    component?: React.ComponentType<any>
}

const transpile = (code: string) => Babel.transform(code, {
    presets: [
        ['typescript', { allExtensions: true, isTSX: true }],
        ['react', { runtime: 'classic' }],
    ],
    //the files of an example import each other
    plugins: ['transform-modules-commonjs'],
    filename: 'grid-snippet.tsx',
})?.code ?? ''

const withoutExtension = (name: string) => name.replace(/^\.\//, '').replace(/\.tsx?$/, '')

/** Why a snippet does not compile, or `null` when it does. */
export const getGridExampleSyntaxError = (code: string): string | null => {
    try {
        transpile(code)
        return null
    } catch (error) {
        return (error as Error).message
    }
}

const compileGridExample = (files: IGridExampleFile[], scope: ISandboxScope, provider: IDataProvider): ICompiledGridExample => {
    const modules = new Map<string, ISnippetModule>()

    const load = (path: string): ISnippetModule => {
        const file = files.find(candidate => withoutExtension(candidate.name) === withoutExtension(path))
        if (!file) {
            throw new Error(`There is no file '${path}' in this example.`)
        }
        const loaded = modules.get(file.name)
        if (loaded) {
            return loaded
        }
        const module: ISnippetModule = { exports: {} }
        //registered first for files that import each other
        modules.set(file.name, module)
        //in a block, so the file may declare a name the scope also has
        const factory = new Function('require', 'module', 'exports', ...SCOPE_NAMES, `{
            ${transpile(file.code)}
            return typeof GridExample !== "undefined" ? GridExample : undefined;
        }`)
        module.component = factory((path: string) => load(path).exports, module, module.exports, ...Object.values(scope), provider)
        return module
    }

    try {
        const entry = load(files[0].name)
        const Component = entry.component ?? entry.exports.GridExample ?? null
        return { Component, error: Component ? null : 'The code must define a GridExample component.' }
    } catch (error) {
        return { Component: null, error: (error as Error).message }
    }
}

interface IGridLivePreviewProps {
    files: IGridExampleFile[]
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
    const code = JSON.stringify(props.files)
    const compiled = React.useMemo(() => compileGridExample(props.files, scope, props.provider), [code])

    React.useEffect(() => {
        props.onError?.(compiled.error)
    }, [compiled.error])

    if (!compiled.Component) {
        return <pre>{compiled.error}</pre>
    }
    const PreviewComponent = compiled.Component
    //keyed by the code: an edit remounts the grid
    return <GridPreviewBoundary key={code}>
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
