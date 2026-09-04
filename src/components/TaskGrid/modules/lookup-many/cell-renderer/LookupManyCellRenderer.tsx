import { useDatasetControl, useTaskDataProvider } from "@components/TaskGrid/context";
import React, { useCallback, useEffect } from "react";
import AsyncSelect from "react-select/async";
import { ICellProps } from "@components/Grid/cells/cell/Cell";
import { ColorfulLookupMany, ILookupManyProps, LookupMany, PeopleLookupMany } from "@components/TaskGrid/modules/lookup-many/components";
import { ThemeProvider } from "@fluentui/react";
import { useGridService } from "@components/Grid/grid/useGridService";

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
export const LookupManyCellRenderer = (props: ICellProps) => {
    const { api, baseColumn, record } = props;
    const datasetControl = useDatasetControl();
    const [isDisabled, setIsDisabled] = React.useState(true);
    //one provider per cell: the picker drives it statefully via setSearchQuery/refresh, so a shared
    //instance would let one open cell clobber another's search
    const dataProvider = React.useMemo(
        () => datasetControl.createLookupManyDataProvider({ record, column: baseColumn }),
        [baseColumn.name, record.getRecordId()],
    );
    const customControl = record.getColumnInfo(baseColumn.name).ui.getCustomControls([])?.[0];
    const controlName = (customControl?.name ?? ControlName.LookupMany) as ControlName;
    const bindings = customControl?.bindings;
    const provider = useTaskDataProvider();
    const isNavigationEnabled = useGridService('settings').isNavigationEnabled();
    const value: ComponentFramework.EntityReference[] | undefined = record.getValue(props.colDef!.colId!) as ComponentFramework.EntityReference[] | undefined;

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
            columnName: baseColumn.name
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
        if (props.value.editable) {
            setIsDisabled(false);
        }
        setTimeout(() => {
            const element = props.eGridCell.querySelector('[data-value]');
            element?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
            element?.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 }));
        })
    }, [props.value.editable]);

    useEffect(() => {
        props.eGridCell.addEventListener('dblclick', onSwitchToEditMode);
        return () => {
            props.eGridCell.removeEventListener('dblclick', onSwitchToEditMode);
        }
    }, [onSwitchToEditMode]);

    return <ThemeProvider>
        {getComponent()}
    </ThemeProvider>
}