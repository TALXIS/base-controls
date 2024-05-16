import dayjs from "dayjs";
import { IComponent } from "../../../../../../interfaces/context";
import { IParameters } from "../../../../../../interfaces/parameters";
import { IDateTime } from "../../../../../DateTime/interfaces";
import { IDecimal } from "../../../../../Decimal/interfaces";
import { IDuration } from "../../../../../Duration";
import { ILookup } from "../../../../../Lookup/interfaces";
import { IMultiSelectOptionSet } from "../../../../../MultiSelectOptionSet/interfaces";
import { IOptionSet } from "../../../../../OptionSet/interfaces";
import { ITextField } from "../../../../../TextField/interfaces";
import { ITwoOptions } from "../../../../../TwoOptions/interfaces";
import { ColumnValidation } from "../../../../validation/model/ColumnValidation";
import { DataType } from "../../../enums/DataType";
import { GridDependency } from "../../../model/GridDependency";
import { IComponentProps } from "../Component";

export class Component extends GridDependency {

    public async getControlProps(props: IComponentProps): Promise<IComponent<any, any, any>> {
        const {column, value, onNotifyOutputChanged, shouldValidate, additionalParameters, formattedValue} = {...props};
        let isValid = true;
        let validationErrorMessage = ""
        if (shouldValidate) {
            [isValid, validationErrorMessage] = new ColumnValidation(props.column).validate(value);
        }
        switch (column.dataType) {
            case DataType.LOOKUP_SIMPLE:
            case DataType.LOOKUP_OWNER: {
                const columnMetadata = await this._grid.metadata.get(column);
                const targets = columnMetadata.Attributes.get(column.attributeName).Targets ?? [];
                if (column.dataType === DataType.LOOKUP_OWNER) {
                    targets.push('systemuser', 'team')
                }
                const result = {
                    context: this._getInjectedContext(additionalParameters),
                    parameters: {
                        value: {
                            //TODO: pass the fetchXml into the lookup so it does not have to fetch id again via id
                            getAllViews: async (entityName: string) => {
                                const response = await this._pcfContext.webAPI.retrieveMultipleRecords('savedquery', `?$filter=returnedtypecode eq '${entityName}' and querytype eq 64`);
                                const result = response.entities[0];
                                return [
                                    {
                                        isDefault: true,
                                        viewName: result.name,
                                        viewId: result.savedqueryid
                                    }
                                ]
                            },
                            raw: await this._getLookupValue(targets, value),
                            attributes: {
                                Targets: targets
                            },
                            error: !isValid,
                            errorMessage: validationErrorMessage,
                        },
                        ...additionalParameters
                    },
                    onNotifyOutputChanged: (outputs) => onNotifyOutputChanged(outputs.value)

                } as ILookup;
                return result;
            }
            case DataType.TWO_OPTIONS: {
                const twoOptionsValue = value as boolean | undefined | null;
                const [defaultValue, options] = await this._grid.metadata.getOptions(column)
                return {
                    context: this._getInjectedContext(additionalParameters),
                    parameters: {
                        value: {
                            raw: twoOptionsValue === true ? true : false,
                            error: !isValid,
                            errorMessage: validationErrorMessage,
                            attributes: {
                                Options: options
                            }
                        },
                        ...additionalParameters
                    },
                    onNotifyOutputChanged: (outputs) => onNotifyOutputChanged(outputs.value)
                } as ITwoOptions
            }
            case DataType.OPTIONSET: {
                const optionSetValue = value as number | null | undefined;
                const [defaultValue, options] = await this._grid.metadata.getOptions(column)
                return {
                    context: this._getInjectedContext(additionalParameters),
                    parameters: {
                        value: {
                            raw: optionSetValue ?? null,
                            error: !isValid,
                            errorMessage: validationErrorMessage,
                            attributes: {
                                Options: options
                            }
                        },
                        ...additionalParameters
                    },
                    onNotifyOutputChanged: (outputs) => onNotifyOutputChanged(outputs.value)
                } as IOptionSet;
            }
            case DataType.MULTI_SELECT_OPTIONSET: {
                const [defaultValue, options] = await this._grid.metadata.getOptions(column)
                const optionSetValue = value as number[] | null | undefined;
                return {
                    context: this._getInjectedContext(additionalParameters),
                    parameters: {
                        value: {
                            raw: optionSetValue ?? null,
                            error: !isValid,
                            errorMessage: validationErrorMessage,
                            attributes: {
                                Options: options
                            }
                        },
                        ...additionalParameters
                    },
                    onNotifyOutputChanged: (outputs) => onNotifyOutputChanged(outputs.value)
                } as IMultiSelectOptionSet
            }
            case DataType.DATE_AND_TIME_DATE_AND_TIME:
            case DataType.DATE_AND_TIME_DATE_ONLY: {
                const dateTimeValue = value as Date | null | undefined;
                const metadata = await this._grid.metadata.get(column);
                const date = dayjs(dateTimeValue);
                return {
                    context: this._getInjectedContext(additionalParameters),
                    parameters: {
                        value: {
                            raw: date.isValid() ? date.toDate() : dateTimeValue,
                            error: !isValid,
                            errorMessage: validationErrorMessage,
                            attributes: {
                                Behavior: metadata.Attributes.get(column.attributeName).Behavior,
                                Format: column.dataType
                            }
                        },
                        ...additionalParameters
                    },
                    onNotifyOutputChanged: (outputs) => onNotifyOutputChanged(outputs.value)
                } as IDateTime;
            }
            case DataType.WHOLE_NONE:
            case DataType.DECIMAL:
            case DataType.CURRENCY:
            case DataType.WHOLE_DURATION: {
                const decimalValue = value as number | null | undefined
                const metadata = await this._grid.metadata.get(column);
                const precision = metadata.Attributes.get(column.attributeName).Precision;
                return {
                    context: this._getInjectedContext(additionalParameters),
                    parameters: {
                        value: {
                            raw: decimalValue ?? null,
                            error: !isValid,
                            //formatted value is only used for currency => there is no way to get the currency symbol so the formatCurrency method is useless
                            formatted: formattedValue,
                            errorMessage: validationErrorMessage,
                            type: column.dataType,
                            attributes: {
                                Precision: precision
                            }
                        },
                        NotifyOutputChangedOnUnmount: {
                            raw: true,
                        },
                        ...additionalParameters
                    },
                    onNotifyOutputChanged: (outputs) => onNotifyOutputChanged(outputs.value)

                } as IDecimal;
            }
            default: {
                return {
                    context: this._getInjectedContext(additionalParameters),
                    parameters: {
                        isResizable: {
                            raw: false
                        },
                        NotifyOutputChangedOnUnmount: {
                            raw: true,
                        },
                        value: {
                            raw: value,
                            error: !isValid,
                            errorMessage: validationErrorMessage
                        },
                        ...additionalParameters
                    },
                    onNotifyOutputChanged: (outputs) => onNotifyOutputChanged(outputs.value)
                } as ITextField
            }
        }
    }
    private _getInjectedContext(additionalParameters?: IParameters) {
        return {
            ...this._pcfContext,
            mode: {
                ...this._pcfContext.mode,
                allocatedHeight: additionalParameters?.Height?.raw ?? this._pcfContext.mode.allocatedHeight,
                allocatedWidth: additionalParameters?.Width?.raw ?? this._pcfContext.mode.allocatedWidth
            }
        }
    }
    private async _getLookupValue(targets: string[], value: ComponentFramework.LookupValue[] | null | undefined): Promise<ComponentFramework.LookupValue[]> {
        if (!value || value.length === 0) {
            return [];
        }
        //this is case from filters where we only have the id to work it => we need to go through targets and search for the records
        //this can be optimized to use less requests
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
}