import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const SET_AG_GRID_OPTION_CODE = `const GridExample = () => {
    const [isTall, setIsTall] = React.useState(false)
    const isTallRef = React.useRef(isTall)
    const runtimeRef = React.useRef<IGridRuntime>()
    const headerHeightModule = React.useMemo<IGridModule>(() => ({
        onRegister: runtime => {
            runtimeRef.current = runtime
            runtime.registerAgGridOptions(result => {
                result.options.headerHeight = isTallRef.current ? 56 : undefined
            })
        },
    }), [])

    React.useEffect(() => {
        isTallRef.current = isTall
        runtimeRef.current?.refreshAgGridOptions()
    }, [isTall])

    return <Stack tokens={{ childrenGap: 8 }}>
        <Toggle label='Tall headers' inlineLabel checked={isTall} onChange={(_event, checked) => setIsTall(!!checked)} />
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule(), custom: [headerHeightModule] }}
            height='440px' />
    </Stack>
}
`

export const USE_AG_GRID_API_CODE = `const GridExample = () => {
    const runtimeRef = React.useRef<IGridRuntime>()
    const getGridApi = () => runtimeRef.current?.services.find('gridApi')

    return <Stack tokens={{ childrenGap: 8 }}>
        <Stack horizontal tokens={{ childrenGap: 8 }}>
            <DefaultButton text='Fit columns to their content' onClick={() => getGridApi()?.autoSizeAllColumns()} />
            <DefaultButton text='Scroll to the last row' onClick={() => {
                const gridApi = getGridApi()
                gridApi?.ensureIndexVisible(gridApi.getDisplayedRowCount() - 1, 'bottom')
            }} />
        </Stack>
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule() }}
            onGridReady={runtime => { runtimeRef.current = runtime }}
            height='400px' />
    </Stack>
}
`

export const SetAgGridOptionExample = () => <GridExampleRunner seedCode={SET_AG_GRID_OPTION_CODE} />
export const UseAgGridApiExample = () => <GridExampleRunner seedCode={USE_AG_GRID_API_CODE} />
