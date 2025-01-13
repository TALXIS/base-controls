import * as React from 'react';
import { Attribute, DataType, IAddControlNotificationOptions, Sanitizer } from '@talxis/client-libraries';
import { useGridInstance } from '../../../hooks/useGridInstance';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import { AgGridContext } from '../../AgGrid/AgGrid';
import { GridCellLabel } from '../../../../../GridCellRenderer/GridCellRenderer';
import { ICellProps } from '../Cell';
import { Control, IBinding } from '../ReadOnlyCell/Component/Control';
import { ITextFieldStyles, useTheme } from '@fluentui/react';
import { getCellContentStyles } from './styles';
import { ControlTheme, IFluentDesignState } from '../../../../../../utils';
import { merge } from 'merge-anything';
import { Theming, useRerender } from '@talxis/react-components';
import { TextField } from '../../../../../TextField';
import { IControl } from '../../../../../../interfaces';
import { TwoOptions } from '../../../../../TwoOptions';
import { OptionSet } from '../../../../../OptionSet';
import { MultiSelectOptionSet } from '../../../../../MultiSelectOptionSet';
import { DateTime } from '../../../../../DateTime';
import { Decimal } from '../../../../../Decimal';
import { Lookup } from '../../../../../Lookup';
import { Duration } from '../../../../../Duration';

interface ICellContentProps extends ICellProps {
    columnAlignment: 'left' | 'center' | 'right';
    notifications: IAddControlNotificationOptions[];
}


export const CellContent = (props: ICellContentProps) => {
    const column = props.baseColumn;
    const dataType: DataType = column.dataType as DataType;
    const grid = useGridInstance();
    const record = props.data;
    const [initialized, setIsInitialized] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const controlRef = React.useRef<Control>();
    const agGridContext = React.useContext(AgGridContext);
    const styles = React.useMemo(() => getCellContentStyles(props.columnAlignment, props.notifications.length > 0), [props.columnAlignment, props.notifications.length > 0]);
    const cellTheme = useTheme();
    const cellThemeRef = React.useRef(cellTheme);
    cellThemeRef.current = cellTheme;
    const rerender = useRerender();

    const cellFormatting = agGridContext.getCellFormatting(props as any);

    if (initialized) {
        controlRef.current?.render();
    }
    const getControl = () => {
        const controls = column.controls;
        const controlForBoth = controls?.find(control => control.appliesTo === 'both');
        if (controlForBoth) {
            return controlForBoth;
        }
        if (props.editing) {
            return controls?.find(control => control.appliesTo === 'cellEditor');
        }
        return controls?.find(control => control.appliesTo === 'cellRenderer');
    }

    const getBindings = (): { [name: string]: IBinding } => {
        const bindings: { [name: string]: IBinding } = {
            'value': {
                isStatic: false,
                type: column.dataType as any,
                valueGetter: () => getBindingValue(),
                onNotifyOutputChanged: (value) => {
                    record.setValue(column.name, value);
                    rerender();
                    grid.pcfContext.factory.requestRender();
                },
                metadata: {
                    attributeName: Attribute.GetNameFromAlias(column.name),
                    enitityName: (() => {
                        const entityAliasName = Attribute.GetLinkedEntityAlias(column.name);
                        if (!entityAliasName) {
                            return grid.dataset.getTargetEntityType()
                        }
                        return grid.dataset.linking.getLinkedEntities().find(x => x.alias === entityAliasName)!.name;
                    })()
                }
            }
        }
        const control = getControl()
        if (control?.bindings) {
            Object.entries(control.bindings).map(([name, binding]) => {
                bindings[name] = {
                    isStatic: true,
                    type: binding.type!,
                    valueGetter: () => binding.value,
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

    const renderBaseControl = (controlProps: IControl<any, any, any, any>, container: HTMLDivElement) => {
        if (props.editing) {
            switch (column.dataType as DataType) {
                case 'Decimal':
                case 'Whole.None':
                case 'Currency': {
                    return ReactDOM.render(React.createElement(Decimal, controlProps), container);
                }
                case 'TwoOptions': {
                    return ReactDOM.render(React.createElement(TwoOptions, controlProps), container);
                }
                case 'OptionSet': {
                    return ReactDOM.render(React.createElement(OptionSet, controlProps), container);
                }
                case 'MultiSelectPicklist': {
                    return ReactDOM.render(React.createElement(MultiSelectOptionSet, controlProps), container);
                }
                case 'DateAndTime.DateAndTime':
                case 'DateAndTime.DateOnly': {
                    return ReactDOM.render(React.createElement(DateTime, controlProps), container);
                }
                case 'Lookup.Simple':
                case 'Lookup.Owner':
                case 'Lookup.Customer':
                case 'Lookup.Regarding': {
                    return ReactDOM.render(React.createElement(Lookup, controlProps), container);
                }
                case 'Whole.Duration': {
                    return ReactDOM.render(React.createElement(Duration, controlProps), container);
                }
                default: {
                    return ReactDOM.render(React.createElement(TextField, controlProps), container);
                }
            }
        }
        return ReactDOM.render(React.createElement(GridCellLabel, controlProps), container);
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
            raw: props.columnAlignment
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

    const createControlInstance = () => {
        return new Control({
            bindings: getBindings(),
            containerElement: containerRef.current!,
            parentPcfContext: grid.pcfContext,
            callbacks: {
                onInit: () => setIsInitialized(true),
                onGetCustomControlName: () => getControl()?.name,
                onIsControlDisabled: () => !props.editing,
            },
            overrides: {
                onRender: (isCustomControl) => {
                    if (isCustomControl) {
                        return undefined;
                    }
                    return (container, controlProps) => renderBaseControl(controlProps, container)
                },
                onUnmount: (isCustomControl) => {
                    if (isCustomControl) {
                        return undefined;
                    }
                    return (container) => {
                        ReactDOM.unmountComponentAtNode(container)
                    }
                },
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
                                    isControlDisabled: {
                                        value: !props.editing
                                    }
                                    
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
        })
    }

    React.useEffect(() => {
        controlRef.current = createControlInstance();
        return () => {
            controlRef.current?.unmount();
        }
    }, []);


    return (
        <div className={styles.cellContent} ref={containerRef} />
    )
}
