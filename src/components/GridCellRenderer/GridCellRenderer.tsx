import { Fragment, useMemo } from "react";
import { DataTypes, IColumn, IDataset, IRecord } from "@talxis/client-libraries";
import { IControl, IOutputs, IParameters, IStringProperty, ITwoOptionsProperty } from "@interfaces";
import { GridCellRendererComponents, IGridCellRendererComponents } from "./components";
import { getSelectedOptions } from "./components/option-set-renderer";
import { IFileValue, IGridCellRenderer } from "./interfaces";
import { getGridCellRendererStyles } from "./styles";

const DEFAULT_PLACEHOLDER = '---';

/**
 * A value, drawn.
 *
 * What it draws follows from the column's data type, and every piece of it can be replaced through
 * `components`. Fills whatever it is put in and paints no background.
 */
export const GridCellRenderer = (props: IGridCellRenderer) => {
    const { ColumnAlignment, Placeholder, PrefixIcon, SuffixIcon, EnableNavigation, Column, Record } = props.parameters;
    const record = Record.raw;
    const column = Column.raw;
    const dataType = column.dataType;
    const enableNavigation = EnableNavigation.raw;
    const alignment = ColumnAlignment.raw ?? 'left';
    const value = record.getValue(column.name);
    const formattedValue = record.getFormattedValue(column.name);
    const isMultiline = isMultilineDataType(dataType);
    const styles = useMemo(() => getGridCellRendererStyles(alignment, isMultiline), [alignment, isMultiline]);
    const components = { ...GridCellRendererComponents, ...props.components };

    const openRecord = (reference?: ComponentFramework.EntityReference) => {
        record.getDataProvider().openDatasetItem(reference ?? record.getNamedReference(), { columnName: column.name });
    };

    const renderValue = (): JSX.Element => {
        if (!formattedValue) {
            return components.onRenderPlaceholder({ text: Placeholder?.raw ?? DEFAULT_PLACEHOLDER, isMultiline: isMultiline });
        }
        switch (dataType) {
            case DataTypes.File:
            case DataTypes.Image: {
                const file: IFileValue | null = value ?? null;
                if (!file) {
                    break;
                }
                //no click handler: the url the value carries is what a file link follows
                return components.onRenderFile({ file: file, isImage: dataType === DataTypes.Image });
            }
            case DataTypes.LookupSimple:
            case DataTypes.LookupOwner:
            case DataTypes.LookupCustomer:
            case DataTypes.LookupRegarding: {
                if (!enableNavigation) {
                    break;
                }
                //every record it names: a lookup's value is an array, and each entry stands for a record
                const references: ComponentFramework.EntityReference[] = Array.isArray(value) ? value : [];
                return components.onRenderLookup({
                    children: references.map((reference, index) => <Fragment key={reference.id?.guid ?? `${reference.name}-${index}`}>
                        {components.onRenderLink({ text: reference.name, onClick: () => openRecord(reference), isMultiline: isMultiline })}
                    </Fragment>),
                });
            }
            case DataTypes.SingleLineEmail:
            case DataTypes.SingleLinePhone:
            case DataTypes.SingleLineUrl: {
                if (!enableNavigation) {
                    break;
                }
                return components.onRenderLink({ text: formattedValue, href: getHref(dataType, value) });
            }
            case DataTypes.OptionSet:
            case DataTypes.MultiSelectOptionSet:
            case DataTypes.TwoOptions: {
                const selected = getSelectedOptions(value, column);
                //a colour is what makes an option worth a shape of its own; without one it is just text
                if (selected.some(option => option.color)) {
                    return components.onRenderOptions({ options: selected, alignment: alignment });
                }
                break;
            }
        }
        //the primary column's value is the one that stands for the record itself
        return enableNavigation && column.isPrimary
            ? components.onRenderLink({ text: formattedValue, onClick: () => openRecord(), isMultiline: isMultiline })
            : components.onRenderText({ text: formattedValue, isMultiline: isMultiline });
    };

    return <div className={styles.gridCellRendererRoot}>
        {PrefixIcon?.raw && components.onRenderPrefixIcon({ iconName: PrefixIcon.raw })}
        {renderValue()}
        {SuffixIcon?.raw && components.onRenderSuffixIcon({ iconName: SuffixIcon.raw })}
    </div>;
};

const isMultilineDataType = (dataType?: string): boolean => {
    switch (dataType) {
        case DataTypes.SingleLineTextArea:
        case DataTypes.Multiple: {
            return true;
        }
        default: {
            return false;
        }
    }
};

const getHref = (dataType: string, value: any): string => {
    switch (dataType) {
        case DataTypes.SingleLineEmail: {
            return `mailto:${value}`;
        }
        case DataTypes.SingleLinePhone: {
            return `tel:${value}`;
        }
        default: {
            return `${value}`;
        }
    }
};
