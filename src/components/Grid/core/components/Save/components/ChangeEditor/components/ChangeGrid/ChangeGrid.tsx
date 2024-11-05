import { useMemo, useRef } from "react";
import { useGridInstance } from "../../../../../../hooks/useGridInstance";
import { Dataset, DataTypes, IColumn, MemoryDataProvider } from "@talxis/client-libraries";
import { DatasetControl } from "../../../../../../../../DatasetControl";
import { CommandBarButton, useTheme } from "@fluentui/react";
import { CommandBar, withButtonLoading } from "@talxis/react-components";
import { getChangeGridStyles } from "./styles";
import { useSave } from "../../../../hooks/useSave";
import { IInternalRecordChange } from "../../../../../../services/ChangeTracker";

interface IChangeGrid {
    recordChange: IInternalRecordChange
    isSavingAll: boolean;
}

const CommandBarButtonWithLoading = withButtonLoading(CommandBarButton);

export const ChangeGrid = (props: IChangeGrid) => {
    const fieldChanges = props.recordChange.columns;
    const baseRecord = props.recordChange.record;
    const grid = useGridInstance();
    const changedColumns = fieldChanges.map((change) => {
        return grid.dataset.columns.find((x) => change.columnName === x.name)!;
    });
    const theme = useTheme();
    const styles = useMemo(() => getChangeGridStyles(theme), [theme]);

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
                    ...baseRecord.getRawData?.()!,
                    id__virtual: "original",
                },
                {
                    ...baseRecord.getRawData?.()!,
                    id__virtual: "new",
                },
            ],
            getColumns(),
            {
                entityMetadata: {
                    PrimaryIdAttribute: "id__virtual",
                },
            }
        );
        const dataset = new Dataset(memoryProvider);
        dataset.addEventListener("onRecordLoaded", (record) => {
            if (record.getRecordId() === "original") {
                changedColumns.map((col) => {
                    record.setDisabledExpression?.(col.name, () => true);
                    record.setValueExpression?.(col.name, () => {
                        return fieldChanges.find(x => x.columnName === col.name)?.originalValue;
                    })
                }
                );
            }
            //new values record
            else {
                changedColumns.map((col) => {
                    record.setNotificationsExpression?.(col.name, () => {
                        const buttons = [];
                        if (!isSavingAllRef.current && !isSavingRef.current) {
                            buttons.push({
                                uniqueId: "clear",
                                title: grid.labels['saving-discard'](),
                                iconName: "EraseTool",
                                compact: true,
                                messages: [],
                                actions: [
                                    {
                                        actions: [
                                            () => {
                                                record.setValue(
                                                    col.name,
                                                    dataset.records.original.getValue(col.name)
                                                );
                                                grid.changeTracker.clearChanges(baseRecord.getRecordId(), col.name);
                                                grid.pcfContext.factory.requestRender();
                                            },
                                        ],
                                    },
                                ],
                            });
                        }
                        return buttons;
                    });
                    record.setDisabledExpression?.(col.name, () => false);
                    record.setRequiredLevelExpression?.(col.name, () => {
                        return baseRecord.getColumnInfo(col.name).security.requiredLevel ?? 'none';
                    });
                    record.setValidationExpression?.(col.name, () => {
                        return baseRecord.getColumnInfo(col.name);
                    });
                });
            }
        });
        return dataset;
    };
    const dataset = useMemo(() => getDataset(), []);
    const { isSaving, save } = useSave(dataset);
    const isSavingAll = props.isSavingAll;
    const isSavingAllRef = useRef(isSavingAll);
    const isSavingRef = useRef(isSaving);
    isSavingRef.current = isSaving;
    isSavingAllRef.current = isSavingAll;

    const getRecordPrimaryName = () => {
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
        return result ?? grid.labels["no-name"];
    };

    return (
        <div className={styles.root}>
            <CommandBar
                className={styles.commandBar}
                items={[
                    {
                        key: "name",
                        text: getRecordPrimaryName(),
                        className: styles.recordName,
                        disabled: true,
                    },
                ]}
                farItems={[
                    {
                        key: "save",
                        commandBarButtonAs: (props) => {
                            return <CommandBarButtonWithLoading
                                disabled={!grid.changeTracker.isValid(baseRecord.getRecordId()) || isSavingAll}
                                title={grid.labels['saving-save-changes']()}
                                text={isSaving ? grid.labels['saving-saving']() : undefined}
                                iconProps={{
                                    iconName: 'Save'
                                }}
                                isLoading={isSaving}
                                onClick={() => save()}
                            />
                        },
                    },
                    {
                        key: "remove",
                        disabled: isSaving || isSavingAll,
                        text: grid.labels['saving-discard-changes'](),
                        onClick: () => {
                            grid.changeTracker.clearChanges(baseRecord.getRecordId());
                            grid.pcfContext.factory.requestRender();
                        },
                        iconProps: {
                            iconName: "EraseTool",
                        },
                    },
                ]}
            />
            <DatasetControl
                context={grid.pcfContext}
                onOverrideComponentProps={(props) => {
                    return {
                        ...props,
                        onDatasetInit: async () => {
                            await dataset.refresh();
                            dataset.records["original"].setValue(
                                "valueDesc__virtual",
                                grid.labels["original-value"]()
                            );
                            dataset.records["new"].setValue(
                                "valueDesc__virtual",
                                grid.labels["new-value"]()
                            );
                            changedColumns.map((col) => {
                                dataset.records["new"].setValue(
                                    col.name,
                                    fieldChanges.find((x) => x.columnName === col.name)
                                        ?.currentValue
                                );
                            });
                            dataset.render();
                            dataset
                                .getDataProvider()
                                .addEventListener(
                                    "onCellValueChanged",
                                    (record, columnName) => {
                                        baseRecord.setValue(
                                            columnName,
                                            record.getValue(columnName)
                                        );
                                        grid.pcfContext.factory.requestRender();
                                    }
                                );
                        },
                    };
                }}
                parameters={{
                    Grid: dataset,
                    EnablePagination: {
                        raw: false,
                    },
                    EnableTopMessageBar: {
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
                    SelectableRows: {
                        raw: "none",
                    },
                }}
            />
        </div>
    );
};
