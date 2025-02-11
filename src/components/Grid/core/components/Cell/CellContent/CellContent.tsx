import * as React from 'react';
import { Attribute, DataType, IColumn, IColumnInfo, ICustomColumnControl, Sanitizer } from '@talxis/client-libraries';
import { useGridInstance } from '../../../hooks/useGridInstance';
import { ICellProps } from '../Cell';
import { IComboBoxStyles, IDatePickerStyles, ITextFieldStyles, useTheme } from '@fluentui/react';
import { getCellContentStyles } from './styles';
import { BaseControls, ControlTheme, IFluentDesignState } from '../../../../../../utils';
import { merge } from 'merge-anything';
import { useRerender } from '@talxis/react-components';
import { NestedControlRenderer } from '../../../../../NestedControlRenderer/NestedControlRenderer';
import { IBinding } from '../../../../../NestedControlRenderer/NestedControl';

interface ICellContentProps extends ICellProps {
    columnAlignment: Required<IColumn['alignment']>;
    fillAllAvailableSpace: boolean;
}

export const CellContent = (props: ICellContentProps) => {
    const { columnAlignment, fillAllAvailableSpace, node } = { ...props };
    const column = props.baseColumn;
    const cellFormatting = props.value.customFormatting;
    const mountedRef = React.useRef(true);
    const dataType: DataType = props.baseColumn.dataType as DataType;
    const grid = useGridInstance();
    const datasetColumn = React.useMemo(() => grid.dataset.columns.find(x => x.name === column.name), [column.name]);
    const record = props.data;
    const styles = React.useMemo(() => getCellContentStyles(props.columnAlignment, fillAllAvailableSpace), [props.columnAlignment, fillAllAvailableSpace]);
    const cellTheme = useTheme();
    const cellThemeRef = React.useRef(cellTheme);
    cellThemeRef.current = cellTheme;
    const rerender = useRerender();
    const customControls = props.value.customControls;
    const error = props.value.error;
    const errorMessage = props.value.errorMessage;
    //defer loading of the nested control to solve edge case where the changed values from onNotifyOutputChanged triggered by unmount would not be available straight away
    const [shouldRenderNestedControl, setShouldRenderNestedControl] = React.useState(false);

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

    const getBindings = (): { [name: string]: IBinding } => {
        const bindings: { [name: string]: IBinding } = {
            'value': {
                isStatic: false,
                type: column.dataType as any,
                value: getBindingValue(),
                error: error,
                errorMessage: errorMessage,
                onNotifyOutputChanged: (value) => {
                    record.setValue(column.name, value);
                    setTimeout(() => {
                        if(mountedRef.current) {
                            rerender();
                        }
                        //allow cell renderer to update the grid
                        if(!props.editing) {
                            grid.pcfContext.factory.requestRender();
                        }
                    }, 0)
                },
                metadata: {
                    attributeName: Attribute.GetNameFromAlias(column.name),
                    entityName: column.getEntityName()
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
        parameters.Column = datasetColumn;

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
        parameters.CellType = {
            raw: props.editing ? 'editor' : 'renderer'
        }
        if (props.editing) {
            parameters.AutoFocus = {
                raw: true
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
                    raw: grid.enableOptionSetColors
                }
                break;
            }
        }
        return parameters;

    }
    const currentControl = getControl();

    const onCellEditingStopped = React.useCallback(() => {
        const changes = record.getChanges?.(column.name);
        if (changes && changes.length > 0) {
            grid.pcfContext.factory.requestRender();
        }
    }, []);

    React.useEffect(() => {
        if (!props.editing) {
            return;
        }
        props.api.addEventListener('cellEditingStopped', onCellEditingStopped);
        return () => {
            if (!props.editing) {
                return;
            }
            setTimeout(() => {
                props.api.removeEventListener('cellEditingStopped', onCellEditingStopped);
            }, 0);
        }
    }, [props.editing]);

    React.useEffect(() => {
        setShouldRenderNestedControl(true);
        return () => {
            mountedRef.current = false;
        }
    }, []);

    if(!shouldRenderNestedControl) {
        return <></>
    }

    return <NestedControlRenderer
        context={grid.pcfContext}
        parameters={{
            ControlName: currentControl.name,
            LoadingType: 'shimmer',
            Bindings: getBindings(),
            ControlStates: {
                isControlDisabled: !props.editing
            }
        }}
        onOverrideComponentProps={(props) => {
            return {
                ...props,
                rootContainerProps: {
                    ...props.rootContainerProps,
                    className: styles.controlRoot
                },
                controlContainerProps: {
                    className: styles.controlContainer
                },
                overridenControlContainerProps: {
                    className: styles.overridenControlContainer
                },
                messageBarProps: {
                    styles: {
                        root: styles.errorMessageRoot,
                        content: styles.errorMessageContent
                    }
                },
                loadingProps: {
                    ...props.loadingProps,
                    shimmerProps: {
                        ...props.loadingProps?.shimmerProps,
                        styles: {
                            ...props.loadingProps?.shimmerProps?.styles,
                            shimmerWrapper: styles.shimmerWrapper
                        }
                    },
                    containerProps: {
                        ...props.loadingProps?.containerProps,
                        className: styles.loadingWrapper
                    }
                },
                onOverrideRender: (controlProps, defaultRender) => { return record.getColumnInfo(column.name).ui.getCustomControlComponent(controlProps, defaultRender)},
                onOverrideControlProps: (controlProps) => {
                    const parameters = getParameters();
                        return {
                            ...controlProps,
                            context: {
                                ...controlProps.context,
                                mode: Object.create(controlProps.context.mode, {
                                    allocatedHeight: {
                                        value: (node.rowHeight ?? grid.rowHeight) - 1
                                    },

                                }),
                                parameters: {
                                    ...controlProps.parameters,
                                    ...parameters
                                },
                                fluentDesignLanguage: getFluentDesignLanguage(controlProps.context.fluentDesignLanguage)
                            },
                            parameters: record.getColumnInfo(column.name).ui.getControlParameters({
                                ...controlProps.parameters,
                                ...parameters
                            })
                        }
                }
            }
        }}
    />
}
