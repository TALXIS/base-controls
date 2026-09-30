import type { IDataProvider, IRecord, IColumn, IFieldValidationResult } from '@talxis/client-libraries'
import type { IGridCellParams, IGridModule, IGridRuntime, IColumnHeaderRendererProps, IGridCellCommands, IRecordLockIndicatorCellComponents, IGridColDef } from '@talxis/base-controls'
import { GRID_SANDBOX_SCOPE } from '../../gridSandboxScope'
const { React, Grid, useGridService, GRID_MODULE_PRIORITY, RECORD_LOCK_COLUMN_KEY, createClientSideRowModelModule, createServerSideRowModelModule, createRowSelectionModule, createCellSelectionModule, createClipboardModule, createSortingModule, createFilteringModule, createGroupingModule, createAggregationModule, createDocsProvider, MemoryDataProvider, DataTypes, Operators, Icon, IconButton, PrimaryButton, DefaultButton, MessageBar, MessageBarType, Stack, Toggle, TooltipHost, mergeStyleSets, FontWeights } = GRID_SANDBOX_SCOPE
declare const provider: IDataProvider
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

export {}
