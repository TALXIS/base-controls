const markWonModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('cells').registerCellCommandsHook((result, { record, columnName }) => {
            if (columnName !== 'name' || Number(record.getValue('stage')) === 4) {
                return
            }
            result.items.push({
                key: 'won',
                text: 'Won',
                iconProps: { iconName: 'CheckMark' },
                onClick: () => record.setValue('stage', 4),
            })
        })
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), custom: [markWonModule] }}
    height='440px' />
