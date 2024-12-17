function onFormLoad(executionContext) {
    const formContext = executionContext.getFormContext();
    const subgrid = formContext.getControl('Subgrid_new_1');
    
    subgrid.addOnOutputChange((executionContext) => {
        const dataset = executionContext.getFormContext().getOutputs()['Subgrid_new_1.DatasetControl'].value;
        dataset.addEventListener('onRecordLoaded', (record) => {});
    })
}