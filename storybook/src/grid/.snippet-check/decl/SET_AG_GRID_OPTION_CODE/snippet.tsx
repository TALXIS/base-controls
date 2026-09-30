const GridExample = () => {
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
