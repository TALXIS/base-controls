import { IServerSideDatasource, IServerSideGetRowsParams } from "@ag-grid-community/core";
import { AgGridModel } from "./AgGridModel";
import { Dataset, DataType, IColumn, IGroupByMetadata, IRecord, Operators } from "@talxis/client-libraries";
import { Filtering } from "../../../../utils/dataset/extensions";
import { Type as FilterType } from "@talxis/client-libraries";

export class ServerSideDatasource implements IServerSideDatasource {
    private _agGrid: AgGridModel

    constructor(agGrid: AgGridModel) {
        this._agGrid = agGrid;

    }
    public async getRows(params: IServerSideGetRowsParams): Promise<void> {
        const records = this.getMainDataset().getDataProvider().getRecords();
        if (params.request.groupKeys.length > 0) {
            const records = await this._getRecordsForGroup(params);
            params.success({
                rowData: records,
                rowCount: records.length
            })
        }
        else {
            params.success({
                rowData: records,
                rowCount: records.length
            })
        }
    }

    public getMainDataset() {
        return this._agGrid.getGrid().getDataset();
    }

    private _getSortedGroupBys(): IGroupByMetadata[] {
        const result: IGroupByMetadata[] = [];
        this.getMainDataset().columns.map(col => {
            if (col.isGrouped) {
                result.push(this.getMainDataset().grouping.getGroupBy(col.name)!);
            }
        })
        return result;

    }

    private async _getRecordsForGroup(params: IServerSideGetRowsParams): Promise<IRecord[]> {
        const rowGroupCols = params.request.rowGroupCols;
        const parentNode = params.parentNode;
        const parentRecord = parentNode.data as IRecord;
        const parentDataProvider = parentRecord.getDataProvider();
        const groupDataProvider = parentDataProvider.getChildDataProvider();
        const groupedColumn = this.getMainDataset().getDataProvider().getColumnsMap().get(params.parentNode.field!)!;
        groupDataProvider.setViewId('');
        groupDataProvider.setColumns(parentDataProvider.getColumns().filter(col => col.name !== groupedColumn.name));
        groupDataProvider.grouping.clear();
        groupDataProvider.aggregation.clear();
        const nextGroupedColumnIndex = rowGroupCols.findIndex(col => col.id === groupedColumn.name) + 1;
        const nextGroupedColumnName = rowGroupCols[nextGroupedColumnIndex]?.id;

        if (nextGroupedColumnName) {
            const groupBy = this.getMainDataset().grouping.getGroupBy(nextGroupedColumnName)!;
            groupDataProvider.grouping.addGroupBy(groupBy);
            const aggr = this.getMainDataset().aggregation.getAggregation(groupBy.columnName)!;
            groupDataProvider.aggregation.addAggregation(aggr);
        }
        this.getMainDataset().aggregation.getAggregations().map(aggr => {
            //adds aggregations that are not grouped
            if (groupDataProvider.grouping.getGroupBys().length > 0 && !this.getMainDataset().grouping.getGroupBy(aggr.columnName)) {
                groupDataProvider.aggregation.addAggregation(aggr);
            }
        })
        const filterDataProvider = groupDataProvider.getChildDataProvider();
        filterDataProvider.setColumns(this.getMainDataset().columns);
        const dataset = new Dataset(filterDataProvider);
        const filtering = new Filtering(() => dataset);
        //this populates all of the filtering
        this.getMainDataset().columns.map(col => {
            filtering.getColumnFilter(col.name);
        })

        const columnFilter = filtering.getColumnFilter(groupedColumn.name);
        const condition = columnFilter.addCondition();
        const value = this._getFilterValueFromRecordValue(parentRecord, groupedColumn.dataType, groupedColumn.name);
        if (value == null) {
            condition.setOperator(Operators.DoesNotContainData.Value)
        }
        else {
            condition.setOperator(Operators.Equal.Value);
            condition.setValue(value);
        }
        const filterExpression = filtering.getFilterExpression(FilterType.And.Value);
        if (!filterExpression) {
            throw new Error('Unexpected error when filtering group dataset');
        }
        groupDataProvider.setFiltering(filterExpression);
        await groupDataProvider.refresh();
        return groupDataProvider.getRecords()
    }

    private _getFilterValueFromRecordValue(record: IRecord, dataType: DataType, columnName: string) {
        const value = this._agGrid.getGrid().getRecordValue(record, columnName);
        if (value == null || (Array.isArray(value) && value.length === 0)) {
            return null;
        }
        switch (dataType) {
            case 'OptionSet': {
                return [value];
            }
            case 'TwoOptions': {
                return [value == '1' ? 1 : 0];
            }
        }
        return value;
    }

}