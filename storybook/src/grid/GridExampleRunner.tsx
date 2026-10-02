import React from 'react'
import Editor from '@monaco-editor/react'
import { ActionButton, initializeIcons, mergeStyleSets, Pivot, PivotItem, Text } from '@fluentui/react'
import type { IDataProvider, IMemoryProvider } from '@talxis/client-libraries'
import { baseEditorOptions } from '../form/shared/monacoEditor'
import { GridCodeEditor } from './GridCodeEditor'
import { getGridExampleSyntaxError, GridLivePreview } from './GridLivePreview'
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

const useDebouncedCode = (code: string, delay = 400) => {
    const [debouncedCode, setDebouncedCode] = React.useState(code)
    React.useEffect(() => {
        const timeout = window.setTimeout(() => setDebouncedCode(code), delay)
        return () => window.clearTimeout(timeout)
    }, [code, delay])
    return debouncedCode
}

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
    /** The snippet the example starts with; it must define a `GridExample` component. */
    seedCode: string
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
    const [code, setCode] = React.useState(props.seedCode)
    const [revision, setRevision] = React.useState(0)
    const [previewError, setPreviewError] = React.useState<string | null>(null)
    const [isCopied, setIsCopied] = React.useState(false)
    const debouncedCode = useDebouncedCode(code)
    const createProvider = () => props.onCreateProvider?.() ?? createDocsDataset(props.dataset ?? 'deals')
    const [provider, setProvider] = React.useState(createProvider)
    const [renderedProvider, setRenderedProvider] = React.useState<IDataProvider>()
    const isEdited = code !== props.seedCode
    const syntaxError = React.useMemo(() => tab === 'code' ? getGridExampleSyntaxError(debouncedCode) : null, [tab, debouncedCode])

    const reset = () => {
        setCode(props.seedCode)
        setProvider(createProvider())
        setRenderedProvider(undefined)
        setRevision(current => current + 1)
    }

    const copy = async () => {
        await navigator.clipboard?.writeText(code)
        setIsCopied(true)
        window.setTimeout(() => setIsCopied(false), 1500)
    }

    const renderTab = () => {
        switch (tab) {
            case 'preview':
                return <>
                    {props.renderAbovePreview?.()}
                    <GridLivePreview key={revision} code={debouncedCode} provider={provider} previewProps={props.previewProps} onError={setPreviewError} onProviderRendered={setRenderedProvider} />
                </>
            case 'code':
                return <GridCodeEditor key={revision} value={code} onChange={setCode} />
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
                <ActionButton iconProps={{ iconName: isCopied ? 'CheckMark' : 'Copy' }} text={isCopied ? 'Copied' : 'Copy code'} onClick={copy} />
            </div>
        </div>
        {renderTab()}
        {tab === 'code' && syntaxError && <Text variant='small' className={styles.error}>{syntaxError}</Text>}
        {tab === 'code' && !syntaxError && previewError && <Text variant='small' className={styles.error}>The last preview failed: {previewError}</Text>}
    </div>
}
