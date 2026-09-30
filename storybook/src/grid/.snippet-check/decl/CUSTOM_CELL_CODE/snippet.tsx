const StageCell = (props: IGridCellParams) => <Grid.Cell.FieldRenderer {...props} components={{
    control: {
        onRenderControl: (controlProps, defaultRender) => {
            if (Number(controlProps.parameters.Record.raw.getValue('stage')) !== 4) {
                return defaultRender(controlProps)
            }
            return <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 9px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, background: '#107c10', color: '#ffffff', fontSize: 12, fontWeight: 600, lineHeight: '16px' }}>
                    <Icon iconName='CheckMark' style={{ fontSize: 10 }} /> Won
                </span>
            </div>
        },
    },
}} />

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule() }}
    colDefs={{ stage: { cellRenderer: StageCell } }}
    height='440px' />
