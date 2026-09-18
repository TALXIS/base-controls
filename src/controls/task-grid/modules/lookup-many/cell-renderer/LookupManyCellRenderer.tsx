import { useDatasetControl, useTaskDataProvider } from "@controls/task-grid/context";
import React, { useCallback, useEffect } from "react";
import AsyncSelect from "react-select/async";
import { IGridCellParams } from "@controls/grid";
import { ColorfulLookupMany, ILookupManyProps, LookupMany, PeopleLookupMany } from "@controls/task-grid/modules/lookup-many/components";
import { useTheme } from "@fluentui/react";
import { ThemeProvider } from "@utils";
import { useGridService } from "@controls/grid";

enum ControlName {
    LookupMany = 'LookupMany',
    PeopleLookupMany = 'PeopleLookupMany',
    ColorfulLookupMany = 'ColorfulLookupMany',
}

/**
 * Renders a lookup-many column. `GridCustomizer` wires this in for any column carrying
 * `metadata.LookupMany`, but only once the `lookupMany` module is registered — this component is what
 * that module contributes as its `components.CellRenderer`. The candidate records come from
 * `datasetControl.createLookupManyDataProvider`, and the visual variant from the column's custom control.
 */
export const LookupManyCellRenderer = (props: IGridCellParams) => {
    const theme = useTheme();
    const { api, data: record } = props;
    const datasetControl = useDatasetControl();
    //the column this is drawing, as the record's own provider has it
    const column = record.getDataProvider().getColumnsMap()[props.colDef!.colId!];
    const [isDisabled, setIsDisabled] = React.useState(true);
    //one provider per cell: the picker drives it statefully via setSearchQuery/refresh, so a shared
    //instance would let one open cell clobber another's search
    const dataProvider = React.useMemo(
        () => datasetControl.createLookupManyDataProvider({ record, column: column }),
        [column.name, record.getRecordId()],
    );
    const customControl = record.getColumnInfo(column.name).ui.getCustomControls([])?.[0];
    const controlName = (customControl?.name ?? ControlName.LookupMany) as ControlName;
    const bindings = customControl?.bindings;
    const provider = useTaskDataProvider();
    const isNavigationEnabled = useGridService('settings').isNavigationEnabled();
    const value: ComponentFramework.EntityReference[] | undefined = record.getValue(props.colDef!.colId!) as ComponentFramework.EntityReference[] | undefined;
    //asked of the column and the record rather than of a cell: this is the column's `cellRenderer`, so
    //there is no `Grid.CellRoot` above it and no cell to ask
    const isEditable = !!props.colDef!.settings?.isEditable && record.getColumnInfo(column.name).security.editable;

    const onSelectionChange = (selectedRecords: ComponentFramework.EntityReference[]) => {
        record.setValue(props.colDef!.colId!, selectedRecords);
        record.save();
        api.refreshCells({
            rowNodes: [props.node],
            columns: [props.colDef!.colId!],
            force: true
        });
    }

    const onRecordOpen = (entityReference: ComponentFramework.EntityReference) => {
        provider.openDatasetItem(entityReference, {
            columnName: column.name
        });
    }

    const onMenuClose = () => {
        setIsDisabled(true);
    }

    const getComponentProps = (): ILookupManyProps => {
        return {
            dataProvider: dataProvider,
            selectedRecords: value,
            isDisabled,
            onRecordSelect: onSelectionChange,
            onRecordOpen: isNavigationEnabled ? onRecordOpen : undefined,
            components: {
                onRenderSelect: (selectProps) =>
                    <AsyncSelect {...selectProps}
                        autoFocus
                        openMenuOnFocus
                        openMenuOnClick
                        styles={{
                            ...selectProps.styles,
                            control: (base, props) => {
                                return {
                                    ...selectProps.styles?.control?.(base, props),
                                    maxHeight: 200,
                                    overflow: 'auto',
                                    border: 'none',
                                    background: 'none',
                                    boxShadow: 'none',
                                }
                            }
                        }}
                        onMenuClose={() => {
                            selectProps.onMenuClose?.();
                            onMenuClose();
                        }} />
            }
        }
    }

    const getComponent = (): JSX.Element => {
        switch (controlName) {
            case ControlName.ColorfulLookupMany:
                return <ColorfulLookupMany
                    colorPropertyName={bindings?.ColorPropertyName?.value}
                    {...getComponentProps()}
                />
            case ControlName.PeopleLookupMany:
                return <PeopleLookupMany
                    {...getComponentProps()}
                    imageUrlPropertyName={bindings?.ImageUrlPropertyName?.value}
                />
            default: {
                return <LookupMany
                    {...getComponentProps()}
                />
            }
        }
    }
    const onSwitchToEditMode = useCallback(() => {
        if (isEditable) {
            setIsDisabled(false);
        }
        setTimeout(() => {
            const element = props.eGridCell.querySelector('[data-value]');
            element?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
            element?.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 }));
        })
    }, [isEditable]);

    useEffect(() => {
        props.eGridCell.addEventListener('dblclick', onSwitchToEditMode);
        return () => {
            props.eGridCell.removeEventListener('dblclick', onSwitchToEditMode);
        }
    }, [onSwitchToEditMode]);

    return <ThemeProvider theme={theme}>
        {getComponent()}
    </ThemeProvider>
}