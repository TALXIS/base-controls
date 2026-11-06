import { DataTypes } from "@talxis/client-libraries";
import { getSelectedOptions } from "../../ui/value-renderer/option-set-renderer";
import { IFileValue } from "../../ui/value-renderer/field-file";
import { ICellUiValueRendererValue, CellUiValueRenderer } from "../../ui/value-renderer/CellUiValueRenderer";
import { IGridValueRenderer } from "./interfaces";

const DEFAULT_PLACEHOLDER = '---';

/** A record's value in a cell, drawn by its column's data type. */
export const GridValueRenderer = (props: IGridValueRenderer) => {
    const { ColumnAlignment, Placeholder, PrefixIcon, SuffixIcon, EnableNavigation, IsPrimaryColumn, IsMultiline, Column, Record, Runtime } = props.parameters;
    const record = Record.raw;
    const column = Column.raw;
    const dataType = column?.dataType;
    const enableNavigation = EnableNavigation.raw;
    const value = column ? record.getValue(column.name) : undefined;
    const formattedValue = column ? record.getFormattedValue(column.name) : null;

    const openRecord = (reference: ComponentFramework.EntityReference) => () => Runtime.raw.openRecord({ record, reference, columnName: column?.name });

    const getValue = (): ICellUiValueRendererValue => {
        if (!formattedValue) {
            return { type: 'placeholder', text: Placeholder?.raw ?? DEFAULT_PLACEHOLDER };
        }
        switch (dataType) {
            case DataTypes.File:
            case DataTypes.Image: {
                const file: IFileValue | null = value ?? null;
                if (file) {
                    return { type: 'file', file, isImage: dataType === DataTypes.Image };
                }
                break;
            }
            case DataTypes.LookupSimple:
            case DataTypes.LookupOwner:
            case DataTypes.LookupCustomer:
            case DataTypes.LookupRegarding: {
                if (!enableNavigation) {
                    break;
                }
                //every record it names: an array, or one reference on its own
                const references: ComponentFramework.EntityReference[] = Array.isArray(value) ? value : value ? [value] : [];
                return {
                    type: 'lookup',
                    links: references.map((reference, index) => ({ key: reference.id?.guid ?? `${reference.name}-${index}`, text: reference.name, onClick: openRecord(reference) })),
                };
            }
            case DataTypes.SingleLineEmail:
            case DataTypes.SingleLinePhone:
            case DataTypes.SingleLineUrl: {
                if (enableNavigation) {
                    return { type: 'link', link: { text: formattedValue, href: getHref(dataType, value) } };
                }
                break;
            }
            case DataTypes.OptionSet:
            case DataTypes.MultiSelectOptionSet:
            case DataTypes.TwoOptions: {
                const selected = getSelectedOptions(value, column!);
                //a colour is what makes an option worth a shape of its own
                if (props.parameters.EnableOptionSetColors?.raw && selected.some(option => option.color)) {
                    return { type: 'options', options: selected };
                }
                break;
            }
        }
        //the primary column's value is the one that stands for the record itself
        return enableNavigation && IsPrimaryColumn?.raw
            ? { type: 'link', link: { text: formattedValue, onClick: openRecord(record.getNamedReference()) } }
            : { type: 'text', text: formattedValue };
    };

    return <CellUiValueRenderer
        value={getValue()}
        alignment={ColumnAlignment.raw ?? 'left'}
        isMultiline={!!IsMultiline?.raw}
        prefixIconName={PrefixIcon?.raw ?? undefined}
        suffixIconName={SuffixIcon?.raw ?? undefined}
        className={props.className}
        components={props.components} />;
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
