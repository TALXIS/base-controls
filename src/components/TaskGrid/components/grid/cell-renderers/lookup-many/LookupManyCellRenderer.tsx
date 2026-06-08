import { IDataProvider, IRecord } from "@talxis/client-libraries";
import { useTaskDataProvider } from "../../../../..";
import React, { useCallback, useEffect } from "react";
import AsyncSelect from "react-select/async";
import { ICellProps } from "../../../../../Grid/cells/cell/Cell";
import { ColorfulLookupMany, ILookupManyProps, LookupMany, PeopleLookupMany } from "../../lookup-many";
import { useAgGridInstance } from "../../../../../Grid/grid/ag-grid/useAgGridInstance";
import { useGridInstance } from "../../../../../Grid/grid/useGridInstance";
import { ThemeProvider } from "@fluentui/react";

interface ICellRendererProps extends ICellProps {
    dataProvider: IDataProvider;
}

enum ControlName {
    LookupMany = 'LookupMany',
    PeopleLookupMany = 'PeopleLookupMany',
    ColorfulLookupMany = 'ColorfulLookupMany',
}

export const LookupManyCellRenderer = (props: ICellRendererProps) => {
    const { api, baseColumn, dataProvider } = props;
    const record: IRecord = props.data;
    const [isDisabled, setIsDisabled] = React.useState(true);
    const customControl = record.getColumnInfo(baseColumn.name).ui.getCustomControls([])?.[0];
    const controlName = (customControl?.name ?? ControlName.LookupMany) as ControlName;
    const bindings = customControl?.bindings;
    const provider = useTaskDataProvider();
    const isNavigationEnabled = useGridInstance().isNavigationEnabled();
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
            dataProvider,
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