import React from 'react'
import Editor from '@monaco-editor/react'
import { ActionButton, initializeIcons, mergeStyleSets, Pivot, PivotItem, Text } from '@fluentui/react'
import type { IDataProvider, IMemoryProvider } from '@talxis/client-libraries'
import { baseEditorOptions } from '../form/shared/monacoEditor'
import { GridCodeEditor } from './GridCodeEditor'
import { getGridExampleSyntaxError, GridLivePreview, IGridExampleFile } from './GridLivePreview'
import { createDocsDataset, IGridDocsDataset } from './data'

//nothing in the grid's tree registers the Fluent icons it draws
initializeIcons()

const styles = mergeStyleSets({
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        flexWrap: 'wrap',
        borderBottom: '1px solid #edebe9',
        marginBottom: 12,
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
    },
    edited: {
        color: '#605e5c',
        marginRight: 4,
    },
    frame: {
        border: '1px solid #edebe9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    error: {
        display: 'block',
        marginTop: 8,
        color: '#a4262c',
    },
})

const useDebounced = <T,>(value: T, delay = 400) => {
    const [debounced, setDebounced] = React.useState(value)
    React.useEffect(() => {
        const timeout = window.setTimeout(() => setDebounced(value), delay)
        return () => window.clearTimeout(timeout)
    }, [value, delay])
    return debounced
}

const toFiles = (seedCode: string | IGridExampleFile[]): IGridExampleFile[] => typeof seedCode === 'string' ? [{ name: 'GridExample.tsx', code: seedCode }] : seedCode

const describeProvider = (provider: IDataProvider) => {
    const memoryProvider = provider as Partial<IMemoryProvider>
    return JSON.stringify({
        metadata: memoryProvider.getMetadata?.(),
        columns: provider.getColumns(),
        records: memoryProvider.getDataSource?.() ?? provider.getRecords().map(record => record.toRawData?.() ?? record.getRecordId()),
    }, null, 2)
}

type IRunnerTab = 'preview' | 'code' | 'data'

export interface IGridExampleRunnerProps {
    /** The snippet the example starts with, or its files; the first must define a `GridExample` component. */
    seedCode: string | IGridExampleFile[]
    /** The docs dataset handed to the snippet as `provider`, loaded; the sales pipeline when omitted. */
    dataset?: IGridDocsDataset
    /** A provider of the example's own, handed to the snippet as `provider` in place of `dataset`. */
    onCreateProvider?: () => IDataProvider
    /** Handed to the snippet's `GridExample` as its props. */
    previewProps?: object
    /** Drawn above the preview, outside the code the reader edits. */
    renderAbovePreview?: () => React.ReactNode
}

/** A live Grid with tabs for its preview, its editable code and the data it is handed. */
export const GridExampleRunner = (props: IGridExampleRunnerProps) => {
    const [tab, setTab] = React.useState<IRunnerTab>('preview')
    const seedFiles = React.useMemo(() => toFiles(props.seedCode), [props.seedCode])
    const [files, setFiles] = React.useState(seedFiles)
    const [activeFile, setActiveFile] = React.useState(seedFiles[0].name)
    const [revision, setRevision] = React.useState(0)
    const [previewError, setPreviewError] = React.useState<string | null>(null)
    const [isCopied, setIsCopied] = React.useState(false)
    const debouncedFiles = useDebounced(files)
    const debouncedCode = debouncedFiles.find(file => file.name === activeFile)?.code ?? ''
    const createProvider = () => props.onCreateProvider?.() ?? createDocsDataset(props.dataset ?? 'deals')
    const [provider, setProvider] = React.useState(createProvider)
    const [renderedProvider, setRenderedProvider] = React.useState<IDataProvider>()
    const isEdited = JSON.stringify(files) !== JSON.stringify(seedFiles)
    const syntaxError = React.useMemo(() => tab === 'code' ? getGridExampleSyntaxError(debouncedCode) : null, [tab, debouncedCode])

    const reset = () => {
        setFiles(seedFiles)
        setProvider(createProvider())
        setRenderedProvider(undefined)
        setRevision(current => current + 1)
    }

    const onFileChange = (name: string, code: string) => {
        setFiles(current => current.map(file => file.name === name ? { ...file, code } : file))
    }

    const copy = async () => {
        await navigator.clipboard?.writeText(files.find(file => file.name === activeFile)?.code ?? '')
        setIsCopied(true)
        window.setTimeout(() => setIsCopied(false), 1500)
    }

    const renderTab = () => {
        switch (tab) {
            case 'preview':
                return <>
                    {props.renderAbovePreview?.()}
                    <GridLivePreview key={revision} files={debouncedFiles} provider={provider} previewProps={props.previewProps} onError={setPreviewError} onProviderRendered={setRenderedProvider} />
                </>
            case 'code':
                return <>
                    {files.length > 1 && <Pivot headersOnly selectedKey={activeFile} onLinkClick={item => setActiveFile(item?.props.itemKey!)}>
                        {files.map(file => <PivotItem key={file.name} itemKey={file.name} headerText={file.name} />)}
                    </Pivot>}
                    <GridCodeEditor key={revision} files={files} activeFile={activeFile} onChange={onFileChange} />
                </>
            case 'data':
                return <div className={styles.frame}>
                    <Editor height='480px' language='json' value={describeProvider(renderedProvider ?? provider)} options={{ ...baseEditorOptions, readOnly: true, domReadOnly: true, padding: { top: 12, bottom: 12 } }} theme='vs-light' />
                </div>
        }
    }

    return <div>
        <div className={styles.toolbar}>
            <Pivot headersOnly selectedKey={tab} onLinkClick={item => setTab(item?.props.itemKey as IRunnerTab)}>
                <PivotItem itemKey='preview' headerText='Preview' itemIcon='View' />
                <PivotItem itemKey='code' headerText='Code' itemIcon='Code' />
                <PivotItem itemKey='data' headerText='Data' itemIcon='Database' />
            </Pivot>
            <div className={styles.actions}>
                {isEdited && <Text variant='small' className={styles.edited}>Edited</Text>}
                <ActionButton iconProps={{ iconName: 'Undo' }} text='Reset' title="Restore the example's code and data" onClick={reset} />
                <ActionButton iconProps={{ iconName: isCopied ? 'CheckMark' : 'Copy' }} text={isCopied ? 'Copied' : files.length > 1 ? 'Copy file' : 'Copy code'} onClick={copy} />
            </div>
        </div>
        {renderTab()}
        {tab === 'code' && syntaxError && <Text variant='small' className={styles.error}>{syntaxError}</Text>}
        {tab === 'code' && !syntaxError && previewError && <Text variant='small' className={styles.error}>The last preview failed: {previewError}</Text>}
    </div>
}
