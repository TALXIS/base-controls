import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { VIEWS_FILE, withFiles } from './shared'

const DRIVE_CODE = `import { loadDeals } from './views'

//a toolbar of your own: it talks to the control, and through it to the parts
const Shortcuts = () => {
    const control = useDatasetControl()

    const searchFor = (query: string) => {
        const quickFind = control.parts.get('quickFind')
        quickFind.setQuery(query)
        quickFind.search()
    }

    return <Stack horizontal wrap tokens={{ childrenGap: 8 }}>
        <DefaultButton text='Won deals' onClick={() => { control.loadView('won') }} />
        <DefaultButton text='Reload' onClick={() => { control.reload() }} />
        <DefaultButton text='Search Contoso' onClick={() => searchFor('Contoso')} />
        <DefaultButton text='Edit columns' onClick={() => control.parts.get('editColumns').open()} />
    </Stack>
}

const GridExample = () => <DatasetControl stateKey='talkingDrive' onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DatasetControl.EditColumns />
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={[createClientSideRowModelModule()]} />
    </DatasetControl.Body>
    <DatasetControl.Footer>
        <DatasetControl.Footer.Start>
            <Shortcuts />
        </DatasetControl.Footer.Start>
    </DatasetControl.Footer>
</DatasetControl>
`

const WATCH_CONTROL_CODE = `import { loadDeals } from './views'

const getLogStyles = (theme: ITheme) => mergeStyleSets({
    log: { padding: '8px 12px', minHeight: 176, border: \`1px solid \${theme.semanticColors.bodyDivider}\`, borderRadius: theme.effects.roundedCorner4, fontFamily: 'Consolas, monospace', fontSize: theme.fonts.medium.fontSize, lineHeight: '22px' },
    line: { color: theme.semanticColors.bodySubtext },
    latest: { color: theme.semanticColors.bodyText, fontWeight: 600 },
})

const GridExample = () => {
    const theme = useTheme()
    const styles = React.useMemo(() => getLogStyles(theme), [theme])
    const [log, setLog] = React.useState<string[]>([])
    //the control of the latest mount, for the buttons outside it
    const controlRef = React.useRef<IDatasetControl>()
    const write = (line: string) => setLog(log => [line, ...log].slice(0, 8))

    //every mount hands over a new control, so subscribe to each one here
    const onSetup = (control: IDatasetControl) => {
        controlRef.current = control
        write('onSetup')
        control.lifecycle.events.addEventListener('onReady', () => write(\`onReady, view \${control.getViewId()}\`))
        control.lifecycle.events.addEventListener('onInitFailed', () => write('onInitFailed'))
        control.lifecycle.events.addEventListener('onRemountRequested', () => write('onRemountRequested'))
        control.lifecycle.events.addEventListener('onDestroyed', () => write('onDestroyed'))
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <Stack horizontal tokens={{ childrenGap: 8 }}>
            <DefaultButton text='Show won deals' onClick={() => { controlRef.current?.loadView('won') }} />
            <DefaultButton text='Reload' onClick={() => { controlRef.current?.reload() }} />
        </Stack>
        <DatasetControl stateKey='talkingWatch' onLoad={loadDeals} onSetup={onSetup} height='380px'>
            <DatasetControl.Header>
                <DatasetControl.Header.Start>
                    <DatasetControl.ViewSwitcher />
                </DatasetControl.Header.Start>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <Grid stateKey='grid' modules={[createClientSideRowModelModule()]} />
            </DatasetControl.Body>
        </DatasetControl>
        <div className={styles.log}>
            {log.map((line, index) => <div key={index} className={index === 0 ? styles.latest : styles.line}>{line}</div>)}
        </div>
    </Stack>
}
`

const MODULE_CODE = `import { loadDeals } from './views'

const CLOSING_SOON: IDatasetControlView = {
    id: 'closingSoon',
    name: 'Closing soon',
    group: { id: 'reports', name: 'Reports' },
    resolve: provider => {
        //sortDirection 0 is ascending
        provider.setSorting([{ name: 'closedate', sortDirection: 0 }])
        return { columns: DEAL_COLUMNS }
    },
}

//loaded anew on every mount, before the control's onLoad
const closingSoonModule: IDatasetControlModule = {
    name: 'closingSoon',
    onLoad: control => {
        control.addViewsHook((views: IDatasetControlView[]) => views.push(CLOSING_SOON))
        //what control.modules.get('closingSoon') returns, typed by types.ts
        return CLOSING_SOON
    },
}

const GridExample = () => <DatasetControl modules={[closingSoonModule]} stateKey='talkingModule' onLoad={loadDeals} height='420px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={[createClientSideRowModelModule()]} />
    </DatasetControl.Body>
</DatasetControl>
`

const MODULE_TYPES_FILE: IGridExampleFile = {
    name: 'types.ts',
    code: `//declares what closingSoonModule's onLoad returns, next to the module in your project
declare module '@talxis/base-controls' {
    interface IDatasetControlModuleMap {
        closingSoon: IDatasetControlView
    }
}

export {}
`,
}

export const DriveTheControlExample = () => <GridExampleRunner seedCode={withFiles(DRIVE_CODE, VIEWS_FILE)} tabs={['preview', 'code']} />
export const WatchTheControlExample = () => <GridExampleRunner seedCode={withFiles(WATCH_CONTROL_CODE, VIEWS_FILE)} tabs={['preview', 'code']} />
export const ModuleExample = () => <GridExampleRunner seedCode={withFiles(MODULE_CODE, VIEWS_FILE, MODULE_TYPES_FILE)} tabs={['preview', 'code']} />
