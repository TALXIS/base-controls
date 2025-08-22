import { Attribute } from "@talxis/client-libraries";
import { ITranslation } from "../../hooks";
import { IGridColumnHeader } from "./interfaces";
import { gridColumnHeaderTranslations } from "./translations";

type Labels = Required<ITranslation<typeof gridColumnHeaderTranslations>>;

interface IDeps {
    getProps: () => IGridColumnHeader;
    getLabels: () => Labels;
}

export class GridColumnHeaderModel {
    private _getProps: () => IGridColumnHeader;
    private _getLabels: () => Labels

    constructor(deps: IDeps) {
        this._getProps = deps.getProps;
        this._getLabels = deps.getLabels;
    }

    public getColumn() {
        return this._getProps().parameters.Column.raw;
    }

    public isGrouped() {
        return !!this.getColumn().grouping?.isGrouped
    }
    public isSortedAsc() {
        return this._getSorting()?.sortDirection === 0;
    }
    public isSortedDesc() {
        return this._getSorting()?.sortDirection === 1;
    }
    public isUneditableIconVisible() {
        if(!this._getProps().parameters.EnableEditing?.raw) {
            return false;
        }
        return !this.getColumn().metadata?.IsValidForUpdate
    }
    public isFiltered() {
        const filtering = this.getDataset().filtering.getFilter();
        return filtering?.conditions.some(condition => condition.attributeName === Attribute.GetNameFromAlias(this.getColumn().name));
    }
    public isRequired() {
        if(!this._getProps().parameters.EnableEditing?.raw) {
            return false;
        }
        switch(this.getColumn().metadata?.RequiredLevel) {
            case 1:
            case 2: {
                return true;
            }
            default: {
                return false;
            }
        }
    }
    public getAggregationLabel() {
        switch (this.getColumn().aggregation?.aggregationFunction) {
            case 'avg': {
                return this._labels.avg();
            }
            case 'max': {
                return this._labels.max();
            }
            case 'min': {
                return this._labels.min();
            }
            case 'sum': {
                return this._labels.sum();
            }
            case 'count': {
                return this._labels.count()
            }
            case 'countcolumn': {
                return this._labels.countcolumn()
            }
            default: {
                undefined;
            }
        }
    }
    public isAggregated() {
        if (this.getColumn().grouping?.isGrouped) {
            return false;
        }
        return !!this.getColumn().aggregation?.aggregationFunction;
    }
    public getDataset() {
        return this._getProps().parameters.Dataset.raw;
    }
    private _getSorting() {
        return this.getDataset().sorting.find(sort => sort.name === this.getColumn().name);
    }
    private get _labels() {
        return this._getLabels();
    }
}