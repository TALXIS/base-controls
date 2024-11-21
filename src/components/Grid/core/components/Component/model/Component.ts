import dayjs from "dayjs";
import { IControl } from "../../../../../../interfaces/context";
import { IDateTime } from "../../../../../DateTime/interfaces";
import { IDecimal } from "../../../../../Decimal/interfaces";
import { ILookup } from "../../../../../Lookup/interfaces";
import { IMultiSelectOptionSet } from "../../../../../MultiSelectOptionSet/interfaces";
import { IOptionSet } from "../../../../../OptionSet/interfaces";
import { ITextField } from "../../../../../TextField/interfaces";
import { ITwoOptions } from "../../../../../TwoOptions/interfaces";
import { DataType } from "../../../enums/DataType";
import { GridDependency } from "../../../model/GridDependency";
import { IControlProps } from "../Component";
import { Attribute, DataTypes, Sanitizer } from "@talxis/client-libraries";
import { IGridColumn } from "../../../interfaces/IGridColumn";

const debounce = (func: (...args: any[]) => Promise<any>, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;
    let promiseCache: Promise<any> | null = null;

    return async (...args: any[]) => {
        if (!promiseCache) {
            promiseCache = func(...args);
        }

        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(() => {
            promiseCache = null;
        }, wait);

        return promiseCache;
    };
};

export class Component extends GridDependency {
    private _debouncedGetLookupValue = debounce(this._getLookupValue.bind(this), 50);
    private static _lookupSavedQueriesCache = new Map<string, Promise<ComponentFramework.WebApi.Entity>>;

    public async getControlProps(props: IControlProps): Promise<IControl<any, any, any, any>> {
        const { column, onNotifyOutputChanged, record} = { ...props };
        const value = this._getComponentValue(column, record.getValue(column.name));
        const formattedValue = record.getFormattedValue(column.name);
        const validation = record.getColumnInfo(column.name);
        const onOverrideControlProps = (passedProps: IControl<any, any, any, any>): any => {
            const overridenProps = props?.onOverrideControlProps?.(passedProps) ?? passedProps;
            overridenProps.parameters = record.ui?.getCellEditorParameters(column.name, overridenProps.parameters) ?? overridenProps.parameters;
            return overridenProps;
        }
        const attributeName = Attribute.GetNameFromAlias(column.name);
        switch (column.dataType) {
            case DataType.LOOKUP_SIMPLE:
            case DataType.LOOKUP_OWNER:
            case DataType.LOOKUP_CUSTOMER: {
                const columnMetadata = await this._grid.metadata.get(column.name);
                const targets = columnMetadata.Attributes.get(attributeName).attributeDescriptor.Targets ?? [];
                //@ts-ignore - typings
                if (column.dataType === DataType.LOOKUP_OWNER && window.TALXIS.Portal) {
                    targets.push('systemuser', 'team')
                }
                let displayName = "";
                if(targets.length === 1) {
                    displayName = (await this._pcfContext.utils.getEntityMetadata(targets[0])).DisplayName;
                }
                const result = {
                    context: this._pcfContext,
                    parameters: {
                        value: {
                            getAllViews: async (entityName: string, __queryType: number = 64) => {
                                const cacheKey = `${entityName}_${__queryType}`
                                if (!Component._lookupSavedQueriesCache.get(cacheKey)) {
                                    Component._lookupSavedQueriesCache.set(cacheKey, new Promise(async (resolve) => {
                                        const response = await this._pcfContext.webAPI.retrieveMultipleRecords('savedquery', `?$filter=returnedtypecode eq '${entityName}' and querytype eq ${__queryType} and isdefault eq true&$select=name,savedqueryid,fetchxml`);
                                        resolve(response.entities[0])
                                    }))
                                }
                                const result = await Component._lookupSavedQueriesCache.get(cacheKey)!;
                                return [
                                    {
                                        isDefault: true,
                                        viewName: result.name,
                                        viewId: result.savedqueryid,
                                        fetchXml: result.fetchxml
                                    }
                                ]
                            },
                            raw: await this._debouncedGetLookupValue(targets, value),
                            attributes: {
                                Targets: targets,
                                DisplayName: displayName
                            },
                            error: validation?.error === false,
                            errorMessage: validation?.errorMessage ?? "",
                        }
                    },
                    onNotifyOutputChanged: (outputs) => onNotifyOutputChanged(outputs.value)

                } as ILookup;
                return onOverrideControlProps(result);
            }
            case DataType.TWO_OPTIONS: {
                const twoOptionsValue = value as boolean | undefined | null;
                const [defaultValue, options] = await this._grid.metadata.getOptions(column.name)
                return onOverrideControlProps({
                    context: this._pcfContext,
                    parameters: {
                        value: {
                            raw: twoOptionsValue === true ? true : false,
                            error: validation?.error === false,
                            errorMessage: validation?.errorMessage ?? "",
                            attributes: {
                                Options: options
                            }
                        }
                    },
                    onNotifyOutputChanged: (outputs) => onNotifyOutputChanged(outputs.value)
                } as ITwoOptions)
            }
            case DataType.OPTIONSET: {
                const optionSetValue = value as number | null | undefined;
                const [defaultValue, options] = await this._grid.metadata.getOptions(column.name)
                return onOverrideControlProps({
                    context: this._pcfContext,
                    parameters: {
                        value: {
                            raw: optionSetValue ?? null,
                            error:  validation?.error === false,
                            errorMessage: validation?.errorMessage ?? "",
                            attributes: {
                                Options: options
                            }
                        },
                    },
                    onNotifyOutputChanged: (outputs) => onNotifyOutputChanged(outputs.value)
                } as IOptionSet);
            }
            case DataType.MULTI_SELECT_OPTIONSET: {
                const [defaultValue, options] = await this._grid.metadata.getOptions(column.name)
                const optionSetValue = value as number[] | null | undefined;
                return onOverrideControlProps({
                    context: this._pcfContext,
                    parameters: {
                        value: {
                            raw: optionSetValue ?? null,
                            error:  validation?.error === false,
                            errorMessage: validation?.errorMessage ?? "",
                            attributes: {
                                Options: options
                            }
                        }
                    },
                    onNotifyOutputChanged: (outputs) => onNotifyOutputChanged(outputs.value)
                } as IMultiSelectOptionSet);
            }
            case DataType.DATE_AND_TIME_DATE_AND_TIME:
            case DataType.DATE_AND_TIME_DATE_ONLY: {
                const dateTimeValue = value as Date | null | undefined;
                const metadata = await this._grid.metadata.get(column.name);
                const date = dayjs(dateTimeValue);
                return onOverrideControlProps({
                    context: this._pcfContext,
                    parameters: {
                        value: {
                            raw: date.isValid() ? date.toDate() : dateTimeValue,
                            error: validation?.error === false,
                            errorMessage: validation?.errorMessage ?? "",
                            attributes: {
                                Behavior: metadata.Attributes.get(attributeName).Behavior,
                                Format: column.dataType
                            }
                        }
                    },
                    onNotifyOutputChanged: (outputs) => onNotifyOutputChanged(outputs.value)
                    
                } as IDateTime);
            }
            case DataType.WHOLE_NONE:
            case DataType.DECIMAL:
            case DataType.CURRENCY:
            case DataType.WHOLE_DURATION: {
                const decimalValue = value as number | null | undefined
                const metadata = await this._grid.metadata.get(column.name);
                const precision = metadata.Attributes.get(attributeName).Precision;
                return onOverrideControlProps({
                    context: this._pcfContext,
                    parameters: {
                        value: {
                            raw: decimalValue ?? null,
                            error: validation?.error === false,
                            //formatted value is only used for currency => there is no way to get the currency symbol so the formatCurrency method is useless
                            formatted: formattedValue,
                            errorMessage: validation?.errorMessage ?? "",
                            type: column.dataType,
                            attributes: {
                                Precision: precision
                            }
                        },
                        NotifyOutputChangedOnUnmount: {
                            //duration is ComboBox => no need to do this
                            raw: column.dataType !== DataType.WHOLE_DURATION,
                        }
                    },
                    onNotifyOutputChanged: (outputs) => onNotifyOutputChanged(outputs.value)

                } as IDecimal);
            }
            default: {
                return onOverrideControlProps({
                    context: this._pcfContext,
                    parameters: {
                        isResizable: {
                            raw: false
                        },
                        NotifyOutputChangedOnUnmount: {
                            raw: true,
                        },
                        value: {
                            raw: value,
                            type: column.dataType,
                            error:  validation?.error === false,
                            errorMessage: validation?.errorMessage ?? ""
                        }
                    },
                    onNotifyOutputChanged: (outputs) => onNotifyOutputChanged(outputs.value)
                } as ITextField);
            }
        }
    }
    private async _getLookupValue(targets: string[], value: ComponentFramework.LookupValue[] | null | undefined): Promise<ComponentFramework.LookupValue[]> {
        if (!value || value.length === 0) {
            return [];
        }
        //this is case from filters where we only have the id to work it => we need to go through targets and search for the records
        if (!value[0].entityType) {
            for (const lookup of value) {
                for (const target of targets) {
                    try {
                        const lookupEntityMetadata = await this._pcfContext.utils.getEntityMetadata(target, []);
                        const response = await this._pcfContext.webAPI.retrieveRecord(target, lookup.id, `?$select=${lookupEntityMetadata.PrimaryNameAttribute}`);
                        lookup.entityType = target;
                        lookup.name = response[lookupEntityMetadata.PrimaryNameAttribute];
                        break;
                    }
                    catch (err) {
                        continue;
                    }
                }
            }
        }
        return value;
    }


    //map because getValue API does not return values 1:1 to PCF bindings
    private _getComponentValue(column: IGridColumn, value: any) {
        switch(column.dataType) {
            //getValue always returns string for TwoOptions
            case DataTypes.TwoOptions: {
                value = value == '1' ? true : false
                break;
            }
            //getValue always returns string for OptionSet
            case DataType.OPTIONSET: {
                value = value ? parseInt(value) : null;
                break;
            }
            case DataType.MULTI_SELECT_OPTIONSET: {
                value = value ? value.split(',').map((x: string) => parseInt(x)) : null;
                break;
            }
            case DataType.LOOKUP_SIMPLE:
            case DataType.LOOKUP_CUSTOMER:
            case DataType.LOOKUP_OWNER: {
                //our implementation returns array, Power Apps returns object
                if(value && !Array.isArray(value)) {
                    value = [value];
                }
                value = value?.map((x: ComponentFramework.EntityReference) => Sanitizer.Lookup.getLookupValue(x))
                break;
            }
        }
        return value;
    }
}