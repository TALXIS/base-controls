import React from 'react';
import { Grid } from '../../../../../../../Grid';
import { useGridInstance } from '../../../../../../hooks/useGridInstance';
import { IUpdatedRecord } from '../../../../../../services/RecordUpdateService/model/RecordUpdateService';
import { Text } from '@fluentui/react/lib/Text';
import { IEntityColumn, IEntityRecord, IGrid, IGridParameters } from '../../../../../../../interfaces';
import { Icon } from '@fluentui/react/lib/components/Icon/Icon';
import { getRecordGridStyles } from './styles';
import { useTheme } from '@fluentui/react';

interface IRecordGrids {
    record: IUpdatedRecord;
}
export const RecordGrids = (props: IRecordGrids) => {
    const grid = useGridInstance();
    const record = { ...props.record };
    const styles = getRecordGridStyles(useTheme());
    const sharedProps: IGrid = {
        context: grid.pcfContext,
        parameters: {
            EnableFiltering: {
                raw: false
            },
            EnablePagination: {
                raw: false
            },
            EnableSorting: {
                raw: false
            },
            Grid: {
                ...grid.dataset,
                columns: [...record.columns.values()],
                paging: {
                    ...grid.dataset.paging,
                    pageSize: 1
                }
            }
        } as IGridParameters
    }

    const invalidColumns = (() => {
        const columns: IEntityColumn[] = [];
        for(const column of record.columns.values()) {
            if(!record.isValid(column.name)) {
                columns.push(column);
            }
        }
        return columns;
    })();

    const hasInvalidColumn = invalidColumns.length > 0;

    const getOriginalRecord = (record: IUpdatedRecord): IEntityRecord => {
        return {
            getFormattedValue: (columnKey: string) => record.getOriginalFormattedValue(columnKey),
            getRecordId: () => record.getRecordId(),
            getNamedReference: () => record.getNamedReference(),
            getValue: (columnKey: string) => record.getOriginalValue(columnKey),
            save: async () => {
                const result = await record.save();
                grid.pcfContext.factory.requestRender();
            },
            //only comes when clear is called to return to the original value
            setValue: (columnKey: string, value: any) => {
                record.clear();
                //TODO: the internal record id map wont get updated
                //with the references to updated records until they appear 
                //in the grid => you cant see the changes 
                grid.pcfContext.factory.requestRender();
            }
        }
    }
    const getUpdatedRecord = (record: IUpdatedRecord): IEntityRecord => {
        return {
            getFormattedValue: (columnKey: string) => record.getFormattedValue(columnKey),
            getRecordId: () => record.getRecordId(),
            getNamedReference: () => record.getNamedReference(),
            getValue: (columnKey: string) => record.getValue(columnKey),
            save: () => { throw new Error('Should not be called!') },
            setValue: (columnKey: string, value: any) => {
                record.setValue(columnKey, value)
                grid.pcfContext.factory.requestRender();
            }
        }
    }

    return (
        <div className={styles.root}>
            <div className={styles.readOnlyGrid}>
                <div className={styles.gridTitleWrapper}>
                    <Text title={record.getOriginalFormattedPrimaryNameValue()} variant='large'>{record.getOriginalFormattedPrimaryNameValue()}</Text>
                </div>
                <Grid
                    {...sharedProps}
                    parameters={{
                        ...sharedProps.parameters,
                        ChangeEditorMode: {
                            raw: "read",
                            error: hasInvalidColumn,
                        },
                        Grid: {
                            ...sharedProps.parameters.Grid,
                            error: hasInvalidColumn,
                            errorMessage: hasInvalidColumn ? grid.labels['saving-validation-error']({
                                columnDisplayNames: invalidColumns.map( x => x.displayName).join(', ')
                            }): undefined,
                            records: {
                                [record.getRecordId()]: getOriginalRecord(record)
                            }
                        },

                    } as IGridParameters} />
            </div>
            <Icon iconName="DoubleChevronDown8" />
            <div className={styles.editableGrid}>
                <Grid
                    {...sharedProps}
                    parameters={{
                        ...sharedProps.parameters,
                        ChangeEditorMode: {
                            raw: "edit"
                        },
                        EnableEditing: {
                            raw: true
                        },
                        Grid: {
                            ...sharedProps.parameters.Grid,
                            records: {
                                [record.getRecordId()]: getUpdatedRecord(record)
                            }
                        }
                    } as IGridParameters} />
            </div>
        </div>
    )
}