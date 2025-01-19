import * as React from 'react';
import { Attribute, DataType, IColumn, IColumnInfo, ICustomColumnControl, ICustomColumnFormatting, Sanitizer } from '@talxis/client-libraries';
import { useGridInstance } from '../../../hooks/useGridInstance';
import { ICellProps } from '../Cell';
import { IComboBoxStyles, IDatePickerStyles, IIconProps, ITextFieldStyles, useTheme } from '@fluentui/react';
import { getCellContentStyles } from './styles';
import { BaseControls, ControlTheme, IFluentDesignState } from '../../../../../../utils';
import { merge } from 'merge-anything';
import { useRerender } from '@talxis/react-components';
import { NestedControlRenderer } from '../../../../../NestedControl/NestedControlRenderer';
import { IBinding } from '../../../../../NestedControl';

interface ICellContentProps extends ICellProps {
    columnAlignment: Required<IColumn['alignment']>;
    columnInfo: IColumnInfo;
    fillAllAvailableSpace: boolean;
    cellFormatting: Required<ICustomColumnFormatting>;
}


export const CellContent = (props: ICellContentProps) => {
    const { columnAlignment, fillAllAvailableSpace, cellFormatting } = { ...props };
    const column = props.baseColumn;
    const dataType: DataType = props.baseColumn.dataType as DataType;
    const grid = useGridInstance();
    const record = props.data;
    const columnInfo = props.columnInfo
    const styles = React.useMemo(() => getCellContentStyles(props.columnAlignment, fillAllAvailableSpace), [props.columnAlignment, fillAllAvailableSpace]);
    const cellTheme = useTheme();
    const cellThemeRef = React.useRef(cellTheme);
    cellThemeRef.current = cellTheme;
    const rerender = useRerender();
    const customControls = columnInfo.customControls;

    const getControl = (): ICustomColumnControl => {
        const appliesToValue = props.editing ? 'editor' : 'renderer';
        const customControl = customControls.find(
            control => control.appliesTo === 'both' || control.appliesTo === appliesToValue
        );
        if (customControl) {
            return customControl;
        }
        const defaultControl: Partial<ICustomColumnControl> = {
            name: props.editing ? BaseControls.GetControlNameForDataType(dataType) : 'GridCellRenderer',
            appliesTo: 'both',
        };
    
        return defaultControl as ICustomColumnControl;
    };

    const getColumnEntityName = () => {
        const entityAliasName = Attribute.GetLinkedEntityAlias(column.name);
        if (!entityAliasName) {
            return grid.dataset.getTargetEntityType()
        }
        return grid.dataset.linking.getLinkedEntities().find(x => x.alias === entityAliasName)!.name;
    }

    const getBindings = (): { [name: string]: IBinding } => {
        const bindings: { [name: string]: IBinding } = {
            'value': {
                isStatic: false,
                type: column.dataType as any,
                value: getBindingValue(),
                error: columnInfo.error,
                errorMessage: columnInfo.errorMessage,
                onNotifyOutputChanged: (value) => {
                    record.setValue(column.name, value);
                    setTimeout(() => {
                        rerender();
                        grid.pcfContext.factory.requestRender()
                    }, 0);
                },
                metadata: {
                    attributeName: Attribute.GetNameFromAlias(column.name),
                    enitityName: getColumnEntityName()
                }
            }
        }
        if (currentControl?.bindings) {
            Object.entries(currentControl.bindings).map(([name, binding]) => {
                bindings[name] = {
                    isStatic: true,
                    type: binding.type!,
                    value: binding.value
                }
            })
        }
        return bindings;
    }

    const getFluentDesignLanguage = (fluentDesignLanguage?: IFluentDesignState) => {
        const mergedOverrides = merge(fluentDesignLanguage?.v8FluentOverrides ?? {}, cellFormatting.themeOverride);
        const result = ControlTheme.GenerateFluentDesignLanguage(cellThemeRef.current.palette.themePrimary, cellThemeRef.current.semanticColors.bodyBackground, cellThemeRef.current.semanticColors.bodyText, {
            v8FluentOverrides: merge(
                {
                    semanticColors: {
                        inputBorder: 'transparent',
                        inputBorderHovered: 'transparent',
                        inputBackground: cellThemeRef.current.semanticColors.bodyBackground,
                        focusBorder: 'transparent',
                        disabledBorder: 'transparent',
                        inputFocusBorderAlt: 'transparent',
                        errorText: 'transparent'

                    },
                    effects: {
                        underlined: false
                    },
                    components: {
                        'TextField': {
                            styles: () => {
                                return {
                                    field: {
                                        textAlign: props.columnAlignment
                                    }
                                } as ITextFieldStyles
                            }
                        },
                        'ComboBox': {
                            styles: () => {
                                return {
                                    input: {
                                        textAlign: props.columnAlignment === 'right' ? 'right' : undefined,
                                        paddingRight: props.columnAlignment === 'right' ? 8 : undefined,
                                    }
                                } as IComboBoxStyles
                            }
                        },
                        'DatePicker': {
                            styles: () => {
                                return {
                                    root: {
                                        '.ms-TextField-field': {
                                            paddingRight: props.columnAlignment === 'right' ? 8 : undefined,
                                            textAlign: props.columnAlignment === 'right' ? 'right' : 'left'
                                        }
                                    } as any
                                } as IDatePickerStyles
                            }
                        }
                    }
                },
                mergedOverrides
            ),
            applicationTheme: fluentDesignLanguage?.applicationTheme
        })
        return result;
    }

    const getBindingValue = () => {
        let value = record.getValue(column.name);
        switch (dataType) {
            //getValue always returns string for TwoOptions
            case 'TwoOptions': {
                value = value == '1' ? true : false
                break;
            }
            //getValue always returns string for OptionSet
            case 'OptionSet': {
                value = value ? parseInt(value) : null;
                break;
            }
            case 'MultiSelectPicklist': {
                value = value ? value.split(',').map((x: string) => parseInt(x)) : null;
                break;
            }
            case 'Lookup.Simple':
            case 'Lookup.Customer':
            case 'Lookup.Owner':
            case 'Lookup.Regarding': {
                //our implementation returns array, Power Apps returns object
                if (value && !Array.isArray(value)) {
                    value = [value];
                }
                value = value?.map((x: ComponentFramework.EntityReference) => Sanitizer.Lookup.getLookupValue(x))
                break;
            }
        }
        return value;
    }

    const getParameters = () => {
        const parameters: any = {
            Dataset: grid.dataset
        }
        parameters.Record = record;
        parameters.Column = column;

        parameters.EnableNavigation = {
            raw: grid.isNavigationEnabled
        }
        parameters.ColumnAlignment = {
            raw: columnAlignment
        }
        parameters.IsPrimaryColumn = {
            raw: column.isPrimary
        }
        parameters.ShowErrorMessage = {
            raw: false
        }
        if (props.editing) {
            parameters.AutoFocus = {
                raw: true
            }
        }
        if (!props.editing) {
            const prefixIcon: IIconProps = {
                iconName: 'Warning',
                title: 'WARNING',
                styles: {
                    root: {
                        color: 'orange'
                    }
                }
            }
            /*              parameters.PrefixIcon = {
                            raw: JSON.stringify(prefixIcon)
                        } */
            parameters.SuffixIcon = {
                raw: JSON.stringify(prefixIcon)
            }
        }
        switch (dataType) {
            case 'Lookup.Customer':
            case 'Lookup.Owner':
            case 'Lookup.Regarding':
            case 'Lookup.Simple': {
                parameters.IsInlineNewEnabled = {
                    raw: false
                }
                break;
            }
            case 'SingleLine.Email':
            case 'SingleLine.Phone':
            case 'SingleLine.URL': {
                parameters.EnableTypeSuffix = {
                    raw: false
                }
                break;
            }
            case 'OptionSet':
            case 'TwoOptions':
            case 'MultiSelectPicklist': {
                parameters.EnableOptionSetColors = {
                    raw: true
                }
                break;
            }
        }
        return parameters;

    }
    const currentControl = getControl();

    return <NestedControlRenderer
        context={grid.pcfContext}
        parameters={{
            ControlName: currentControl.name,
            Bindings: getBindings(),
            ControlStates: {
                isControlDisabled: !props.editing
            }
        }}
        onOverrideComponentProps={(props) => {
            return {
                ...props,
                rootClassName: styles.cellContent,
                onGetProps: () => {
                    return (controlProps) => {
                        const parameters = getParameters();
                        return {
                            ...controlProps,
                            context: {
                                ...controlProps.context,
                                mode: Object.create(controlProps.context.mode, {
                                    allocatedHeight: {
                                        value: 39
                                    },

                                }),
                                parameters: {
                                    ...controlProps.parameters,
                                    ...parameters
                                },
                                fluentDesignLanguage: getFluentDesignLanguage(controlProps.context.fluentDesignLanguage)
                            },
                            parameters: {
                                ...controlProps.parameters,
                                ...parameters
                            }
                        }
                    }
                }
            }
        }}
    />
}
