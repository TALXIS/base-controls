import { DataType } from "@talxis/client-libraries";
import { Property } from "./properties/Property";
import { Email } from "./properties/Email";
import { Phone } from "./properties/Phone";
import { IGridCellRenderer } from "./interfaces";
import { ITranslation } from "../../hooks";
import { gridGroupCellRendererTranslations } from "./translations";
import { Url } from "./properties/Url";
import { Lookup } from './properties/Lookup';
import { IIconProps, ITheme } from "@fluentui/react";
import { MultilineText } from "./properties/MultilineText";
import { OptionSet } from "./properties/OptionSet";
import { MultiSelectOptionSet } from "./properties/MultiSelectOptionSet";
import { TwoOptions } from "./properties/TwoOptions";
import { File } from "./properties/File";
import { Image } from "./properties/Image";
import { TickMemoizer } from '@talxis/client-libraries/dist/helpers/cache/TickMemoizer'

type Labels = Required<ITranslation<typeof gridGroupCellRendererTranslations>>;

interface IDeps {
    getProps: () => IGridCellRenderer;
    getControlTheme: () => ITheme;
    labels: Labels;
}

const propertyMap: Map<DataType, typeof Property> = new Map([
    ['SingleLine.Email', Email],
    ['SingleLine.Phone', Phone],
    ['SingleLine.URL', Url],
    ['Lookup.Customer', Lookup],
    ['Lookup.Owner', Lookup],
    ['Lookup.Simple', Lookup],
    ['Lookup.Regarding', Lookup],
    ['OptionSet', OptionSet],
    ['MultiSelectPicklist', MultiSelectOptionSet],
    ['TwoOptions', TwoOptions],
    ['SingleLine.TextArea', MultilineText],
    ['Multiple', MultilineText],
    ['File', File],
    ['Image', Image]
]);

type MemoizedFunction = 'getSuffixIconProps' | 'getPrefixIconProps';

export class GridCellRendererModel {
    private _getProps: () => IGridCellRenderer;
    private _getControlTheme: () => ITheme;
    private _property: Property;
    private _labels: Labels;
    private _tickMemoizer: TickMemoizer<MemoizedFunction> = new TickMemoizer();
    
    constructor(deps: IDeps) {
        this._getProps = deps.getProps;
        this._labels = deps.labels;
        this._getControlTheme = deps.getControlTheme;
        this._property = this._getPropertyInstance();
    }

    public getValue() {
        return this._getProps().parameters.value.raw;
    }

    public getFormattedValue() {
        return this._getProps().parameters.value.formatted ?? null;
    }

    public isTotalRow() {
        return this.getRecord().getDataProvider().getSummarizationType() === 'aggregation';
    }

    public getFileAttachmentIcon() {
        return this._getPropertyInstance().getFileAttachmentIcon();
    }

    public getImageThumbnailUrl() {
        return this._getPropertyInstance().getImageThumbnailUrl();
    }

    public getPrefixIconProps(): IIconProps | undefined {
        return this._tickMemoizer.getOnce('getPrefixIconProps', () => this._getIconProps('PrefixIcon'))
    }

    public shouldUsePortalDownload(): boolean {
        return this._property.shouldUsePortalDownload();
    }

    public getSuffixIconProps(): IIconProps | undefined {
        return this._tickMemoizer.getOnce('getSuffixIconProps', () => this._getIconProps('SuffixIcon'))
    }

    public getColumn() {
        return this._getProps().parameters.Column.raw;
    }

    public getRecord() {
        return this._getProps().parameters.Record.raw;
    }

    public getDataset() {
        return this._getProps().parameters.Dataset.raw;
    }

    public getValueAttributes() {
        return this._getProps().parameters.value.attributes ?? {};
    }

    public getLinkProps() {
        if (this.getValue() == null || this._getProps().parameters.EnableNavigation?.raw === false) {
            return null;
        }
        return this._property.getLinkProps();
    }

    public async downloadPortalFile() {
        return this._property.downloadPortalFile();
    }

    public getColorfulOptionSet() {
        if (this.getValue() == null || this._getProps().parameters.EnableOptionSetColors?.raw !== true) {
            return null;
        }
        return this._property.getColorfulOptionSet();
    }

    public getFormattedAggregatedValue(): string | null {
        const aggregatedFormattedValue = this._getProps().parameters.AggregatedValue?.formatted ?? null;
        if(!aggregatedFormattedValue) {
            return null;
        }
        else if(this.getValue() != null) {
            return `(${aggregatedFormattedValue})`
        }
        else {
            return aggregatedFormattedValue;
        }
    }

    public getAggregationLabel() {
        const aggregationFunction = this._getProps().parameters.AggregateFunction?.raw;
        switch (aggregationFunction) {
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
        }
    }

    public getContext() {
        return this._getProps().context;
    }

    public getControlTheme() {
        return this._getControlTheme();
    }

    public getColumnAlignment() {
        return this._getProps().parameters.ColumnAlignment.raw;
    }

    public isMultiline() {
        if(this.isTotalRow()) {
            return false;
        }
        return this._property.isMultiline();
    }

    public isFile() {
        return this._property.isFile();
    }

    private _getPropertyInstance(): Property {
        const dataType = this._getProps().parameters.value.type as DataType;
        const PropertyClass = propertyMap.get(dataType) ?? Property;
        return new PropertyClass(this);
    }

    private _getIconProps(propName: 'PrefixIcon' | 'SuffixIcon'): IIconProps | undefined {
        const rawJson = this._getProps().parameters[propName]?.raw;
        if (!rawJson) {
            return undefined;
        }
        return JSON.parse(rawJson);
    }

}