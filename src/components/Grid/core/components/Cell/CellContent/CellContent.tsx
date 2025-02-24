import * as React from 'react';
import { useGridInstance } from '../../../hooks/useGridInstance';
import { ICellProps } from '../Cell';
import { getCellContentStyles } from './styles';
import { NestedControlRenderer } from '../../../../../NestedControlRenderer/NestedControlRenderer';
import { ControlTheme, IFluentDesignState } from '../../../../../../utils';
import { merge } from 'merge-anything';
import { IComboBoxStyles, IDatePickerStyles, ITextFieldStyles, useTheme } from '@fluentui/react';
import { useRerender } from '@talxis/react-components';

interface ICellContentProps extends ICellProps {
    fillAllAvailableSpace: boolean;
}

export const CellContent = (props: ICellContentProps) => {
    const { fillAllAvailableSpace } = { ...props };
    const column = props.baseColumn;
    const mountedRef = React.useRef(false);
    const rerender = useRerender();
    const valueRef = React.useRef(props.value);
    valueRef.current = props.value;
    const grid = useGridInstance();
    const record = props.data;
    const node = props.node;
    const themeRef = React.useRef(useTheme());
    themeRef.current = useTheme();
    const styles = React.useMemo(() => getCellContentStyles(props.value.columnAlignment, fillAllAvailableSpace), [props.value.columnAlignment, fillAllAvailableSpace]);
    //defer loading of the nested control to solve edge case where the changed values from onNotifyOutputChanged triggered by unmount would not be available straight away
    const [shouldRenderNestedControl, setShouldRenderNestedControl] = React.useState(false);

    const getFluentDesignLanguage = (fluentDesignLanguage?: IFluentDesignState) => {
        const formatting = valueRef.current.customFormatting;
        const mergedOverrides = merge(fluentDesignLanguage?.v8FluentOverrides ?? {}, formatting.themeOverride);

        const columnAlignment = grid.getColumnAlignment(column);
        const result = ControlTheme.GenerateFluentDesignLanguage(formatting.primaryColor, formatting.backgroundColor, formatting.textColor, {
            v8FluentOverrides: merge(
                {
                    semanticColors: {
                        inputBorder: 'transparent',
                        inputBorderHovered: 'transparent',
                        inputBackground: formatting.backgroundColor,
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
                            styles: {
                                field: {
                                    textAlign: columnAlignment
                                }
                                
                            } as ITextFieldStyles
                        },
                        'ComboBox': {
                            styles: {
                                input: {
                                    textAlign: columnAlignment === 'right' ? 'right' : undefined,
                                    paddingRight: columnAlignment === 'right' ? 8 : undefined,
                                }
                            } as IComboBoxStyles
                        },
                        'DatePicker': {
                            styles: {
                                root: {
                                    '.ms-TextField-field': {
                                        paddingRight: columnAlignment === 'right' ? 8 : undefined,
                                        textAlign: columnAlignment === 'right' ? 'right' : 'left'
                                    }
                                } as any
                            } as IDatePickerStyles
                        }
                    }
                },
                mergedOverrides
            ),
            applicationTheme: fluentDesignLanguage?.applicationTheme
        })
        return result;
    }


    React.useEffect(() => {
        mountedRef.current = true;
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
            ControlName: grid.getControl(column, record, props.editing).name,
            LoadingType: 'shimmer',
            Bindings: grid.getBindings(record, column, props.editing, valueRef.current.customControl),
            ControlStates: {
                isControlDisabled: !props.editing
            },
            __DoNotUnmountComponentFromDOM: {
                raw: true
            }
        }}
        onNotifyOutputChanged={(outputs) => {
            grid.onNotifyOutputChanged(record, column, props.editing, outputs.value, () => rerender())
        }}
        onOverrideComponentProps={(componentProps) => {
            return {
                ...componentProps,
                rootContainerProps: {
                    ...componentProps.rootContainerProps,
                    className: styles.controlRoot
                },
                controlContainerProps: {
                    className: styles.controlContainer
                },
                overridenControlContainerProps: {
                    className: styles.overridenControlContainer
                },
                messageBarProps: {
                    ...componentProps.messageBarProps,
                    styles: {
                        root: styles.errorMessageRoot,
                        content: styles.errorMessageContent
                    }
                },
                loadingProps: {
                    ...componentProps.loadingProps,
                    shimmerProps: {
                        ...componentProps.loadingProps.shimmerProps,
                        styles: {
                            ...componentProps.loadingProps?.shimmerProps?.styles,
                            shimmerWrapper: styles.shimmerWrapper
                        }
                    },
                    containerProps: {
                        ...componentProps.loadingProps?.containerProps,
                        className: styles.loadingWrapper
                    }
                },
                onOverrideRender: (control, isCustomPcfComponent, defaultRender) => {
                    if(isCustomPcfComponent) {
                        grid.setUsesNestedPcfs();
                    }
                    if(valueRef.current.customComponent) {
                        return valueRef.current.customComponent.onRender(control.getProps(), themeRef.current, control.getContainer())
                    }
                    return defaultRender();
                 },
                onOverrideUnmount: (control, defaultUnmount) => {
                    if(valueRef.current.customComponent) {
                        return valueRef.current.customComponent.onUnmount(control.getContainer());
                    }
                    //@ts-ignore - internal types
                    //skip the unmounting for custom PCF's in Power Apps
                    // PCF unmount in Power Apps causes other nested PCF's to reinitialize which causes flickering
                    //umounting of nested PCF's happens on grid destroy to prevent memory leaks (currently done by refreshing the page as no better method was found)
                    if(control.isMountedPcfComponent() && !grid.getClient().isTalxisPortal()) {
                        return;
                    }
                    return defaultUnmount();
                },
                onOverrideControlProps: (controlProps) => {
                    const parameters = grid.getParameters(record, column, props.editing)
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
