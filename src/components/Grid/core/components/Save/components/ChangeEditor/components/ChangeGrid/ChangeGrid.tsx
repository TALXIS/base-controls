import { useEffect, useMemo, useRef } from "react";
import { useGridInstance } from "../../../../../../hooks/useGridInstance";
import {
    Dataset,
    DataTypes,
    IColumn,
    IDataset,
    IRecordChange,
    MemoryDataProvider,
} from "@talxis/client-libraries";
import { DatasetControl } from "../../../../../../../../DatasetControl";
import { useTheme } from "@fluentui/react";
import { getChangeGridStyles } from "./styles";
import React from "react";
import { AgGridContext } from "../../../../../AgGrid/context";

interface IChangeGrid {
    recordChange: IRecordChange;
    onDatasetReady: (dataset: IDataset) => void;
    onDatasetDestroyed: (dataset: IDataset) => void;
    onIsSaving: (value: boolean) => void;
    onRequestRender: () => void;
}

export const ChangeGrid = (props: IChangeGrid) => {
    const fieldChangesRef = useRef(props.recordChange.columns);
    fieldChangesRef.current = props.recordChange.columns;
    const baseRecord = props.recordChange.record;
    const grid = useGridInstance();
    const changedColumns = fieldChangesRef.current.map((change) => {
        return grid.dataset.columns.find((x) => change.columnName === x.name)!;
    });
    const agGridContext = React.useContext(AgGridContext);

    const recordPrimaryName = (() => {
        let result;
        const primaryColumn = grid.dataset.columns.find((col) => col.isPrimary);
        if (primaryColumn) {
            result = baseRecord.getFormattedValue(primaryColumn.name);
        } else {
            const firstTextColumn = grid.dataset.columns.find(
                (col) => col.dataType === DataTypes.SingleLineText
            );
            if (firstTextColumn) {
                result = baseRecord.getFormattedValue(firstTextColumn.name);
            }
        }
        return result ?? grid.labels["no-name"]();
    })();

    const theme = useTheme();
    const styles = useMemo(() => getChangeGridStyles(theme, recordPrimaryName), [theme, recordPrimaryName]);

    useEffect(() => {
        props.onDatasetReady(dataset);
        return () => {
            props.onDatasetDestroyed(dataset);
            agGridContext.rerender();
        }
    }, []);

    const getColumns = (): IColumn[] => {
        const virtualColumns: IColumn[] = [
            {
                name: "id__virtual",
                alias: "id__virtual",
                visualSizeFactor: 0,
                dataType: DataTypes.SingleLineText,
                displayName: "",
                order: 0,
                isHidden: true,
            },
            {
                name: "valueDesc__virtual",
                alias: "valueDesc__virtual",
                visualSizeFactor: 150,
                dataType: DataTypes.SingleLineText,
                displayName: "",
                order: 1,
            },
        ];
        return [...virtualColumns, ...changedColumns];
    };

    const getDataset = () => {
        const memoryProvider = new MemoryDataProvider(
            [
                {
                    id__virtual: "original",
                    'valueDesc__virtual': grid.labels["original-value"](),
                },
                {
                    id__virtual: "new",
                    'valueDesc__virtual': grid.labels["new-value"](),
                },
            ]
        );
        memoryProvider.setColumns(getColumns());
        memoryProvider.setMetadata({
            PrimaryIdAttribute: "id__virtual"
        })
        const dataset = new Dataset(memoryProvider);
        grid.dataset.linking.getLinkedEntities().map(x => dataset.linking.addLinkedEntity(x))

        dataset.addEventListener('onRecordLoaded', (record) => {
            const recordId = record.getRecordId();
            record.expressions.ui.setCustomFormattingExpression('valueDesc__virtual', (cellTheme) => {
                return {
                    themeOverride: {
                        fonts: {
                            medium: {
                                fontWeight: 600
                            }
                        }
                    }
                }
            })
            changedColumns.map(col => {
                const change = fieldChangesRef.current.find(x => x.columnName === col.name);
                record.expressions?.setCurrencySymbolExpression(col.name, () => baseRecord.getCurrencySymbol?.(col.name) ?? "");
                //we need to store the previous values somewhere, in changes?
                //record.expressions?.ui.setCustomFormattingExpression(col.name, (cellTheme) => baseRecord.getColumnInfo(col.name).ui.getCustomFormatting(cellTheme));
                record.expressions?.ui.setControlParametersExpression(col.name, (parameters) => baseRecord.getColumnInfo(col.name).ui.getControlParameters(parameters));
                record.expressions?.ui.setCustomControlsExpression(col.name, (defaultCustomControls) => baseRecord.getColumnInfo(col.name).ui.getCustomControls(defaultCustomControls));
                record.expressions?.ui.setCustomControlComponentExpression(col.name, () => baseRecord.getColumnInfo(col.name).ui.getCustomControlComponent())
                if (recordId === 'new') {
                    record.expressions?.setValueExpression?.(col.name, () => {
                        //this happens if we have removed a change
                        if (!change) {
                            return baseRecord.getValue(col.name);
                        }
                        return change.originalValue;
                    })
                    if(!change) {
                        record.setValue(col.name, record.getValue(col.name))
                    }
                    else {
                        record.setValue(col.name, change.currentValue);
                    }
                    record.expressions?.ui.setNotificationsExpression?.(col.name, () => {
                        return [
                            {
                                uniqueId: "clear",
                                title: grid.labels["saving-discard"](),
                                iconName: "EraseTool",
                                compact: true,
                                messages: [],
                                actions: [
                                    {
                                        actions: [
                                            () => {
                                                baseRecord.clearChanges?.(col.name);
                                                record.setValue(col.name, baseRecord.getValue(col.name))
                                            },
                                        ],
                                    },
                                ],
                            }
                        ]
                    })
                    record.expressions?.setValidationExpression?.(col.name, () => baseRecord.getColumnInfo(col.name))
                }
                else if (recordId === 'original') {
                    record.expressions?.setDisabledExpression?.(col.name, () => true);
                    record.expressions?.setValueExpression?.(col.name, () => {
                        //this happens if we have removed a change
                        if (!change) {
                            return baseRecord.getValue(col.name);
                        }
                        return change.originalValue;
                    })
                }
            });
        })

        dataset.addEventListener('onRecordColumnValueChanged', (record, columnName) => {
            baseRecord.setValue(columnName, record.getValue(columnName)); 
            props.onRequestRender(); 
        })
        dataset.addEventListener('onChangesCleared', () => {
            baseRecord.clearChanges?.();
            props.onRequestRender();
        })
        dataset.addEventListener('onRecordSave', async () => {
            props.onIsSaving(true);
            await baseRecord.save();
            baseRecord.clearChanges?.();
            props.onIsSaving(false);
            props.onRequestRender();
        })
        return dataset;
    };
    const dataset = useMemo(() => getDataset(), []);
    return (
        <div className={styles.root}>
            <DatasetControl
                context={{
                    ...grid.pcfContext,
                    parameters: {
                        ...grid.pcfContext.parameters,
                        Grid: dataset,
                    },
                }}
                parameters={{
                    Grid: dataset,
                    EnablePagination: {
                        raw: false,
                    },
                    EnableFiltering: {
                        raw: false,
                    },
                    EnableEditing: {
                        raw: true,
                    },
                    EnableNavigation: {
                        raw: false,
                    },
                    EnableOptionSetColors: grid.parameters.EnableOptionSetColors,
                    EnableSorting: {
                        raw: false,
                    },
                    EnableChangeEditor: {
                        raw: false
                    },
                    SelectableRows: {
                        raw: "none",
                    },
                }}
            />
        </div>
    );
};
