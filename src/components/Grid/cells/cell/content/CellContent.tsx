import { useTheme, ITextFieldStyles, IComboBoxStyles, IDatePickerStyles, IToggleStyles } from "@fluentui/react";
import { Client, ICommand } from "@talxis/client-libraries";
import { useRerender } from "@talxis/react-components";
import { merge } from "merge-anything";
import React from "react";
import { useDebouncedCallback } from "use-debounce";
import { IFluentDesignState, ControlTheme } from "../../../../../utils";
import { NestedControlRenderer } from "../../../../NestedControlRenderer";
import { getJustifyContent } from "../../../grid/styles";
import { useGridInstance } from "../../../grid/useGridInstance";
import { ICellProps } from "../Cell";
import { getCellContentStyles } from "./styles";

const client = new Client();

interface ICellContentProps extends ICellProps {
    recordCommands?: ICommand[];
}


export const CellContent = (props: ICellContentProps) => {
    const columnRef = React.useRef(props.baseColumn);
    const mountedRef = React.useRef(false);
    const valueRef = React.useRef(props.value);
    const recordCommands = props.recordCommands;
    columnRef.current = props.baseColumn;
    valueRef.current = props.value;
    const rerender = useRerender();
    const grid = useGridInstance();
    const record = props.data;
    const node = props.node;
    const themeRef = React.useRef(useTheme());
    themeRef.current = useTheme();
    const styles = React.useMemo(() => getCellContentStyles(valueRef.current.columnAlignment), [valueRef.current.columnAlignment]);
    //defer loading of the nested control to solve edge case where the changed values from onNotifyOutputChanged triggered by unmount would not be available straight away
    const [shouldRenderNestedControl, setShouldRenderNestedControl] = React.useState(false);
    const getColumn = () => {
        return columnRef.current;
    }

    const getFluentDesignLanguage = (fluentDesignLanguage?: IFluentDesignState) => {
        //@ts-ignore
        const formatting = grid.getFieldFormatting(record, getColumn().name);
        const mergedOverrides: any = merge({}, fluentDesignLanguage?.v8FluentOverrides ?? {}, formatting.themeOverride);
        const columnAlignment = valueRef.current.columnAlignment;
        const result = ControlTheme.GenerateFluentDesignLanguage(formatting.primaryColor, formatting.backgroundColor, formatting.textColor, {
            v8FluentOverrides: merge({},
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
                    fonts: record.getDataProvider().getSummarizationType() === 'aggregation' ? {
                        medium: {
                            fontWeight: 600 as any
                        }
                    }: {},
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
                        },
                        'Toggle': {
                            styles: {
                                root: {
                                    justifyContent: getJustifyContent(columnAlignment)
                                }
                            } as IToggleStyles
                        }
                    }
                },
                mergedOverrides
            ),
            applicationTheme: fluentDesignLanguage?.applicationTheme
        })
        return result;
    }

    const onNotifyOutputChanged = (outputs: any) => {
        let isEditing = props.isCellEditor;
        //if we are not mounted, set editing to true so requestRender gets run
        //if this is not present, a PCF editor might trigger this too late and we would not see the current value in renderer until next
        if (!mountedRef.current) {
            isEditing = false;
        }
        grid.onNotifyOutputChanged(record, columnRef.current, isEditing, outputs.value, () => rerender())
    }
    const debouncedNotifyOutputChanged = useDebouncedCallback((outputs) => onNotifyOutputChanged(outputs), 100);

    React.useEffect(() => {
        mountedRef.current = true;
        setShouldRenderNestedControl(true);
        return () => {
            mountedRef.current = false;
        }
    }, []);

    if (!shouldRenderNestedControl) {
        return <></>
    }
    return <NestedControlRenderer
        context={grid.getPcfContext()}
        parameters={{
            ControlName: valueRef.current.customControl.name,
            LoadingType: 'shimmer',
            Bindings: grid.getBindings(record, getColumn(), valueRef.current.customControl),
            ControlStates: {
                isControlDisabled: !valueRef.current.editing
            },
        }}
        onNotifyOutputChanged={(outputs) => {
            //talxis portal does not have debounce for notifyoutput
            //Power Apps does a debounce of 100ms
            //TODO: make part of nested control renderer
            if (getColumn().oneClickEdit && client.isTalxisPortal()) {
                debouncedNotifyOutputChanged(outputs);
            }
            else {
                onNotifyOutputChanged(outputs);
            }
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
                    if (isCustomPcfComponent) {
                        //grid.setUsesNestedPcfs();
                    }
                    if (valueRef.current.customComponent) {
                        const result = valueRef.current.customComponent.onRender(control.getProps(), themeRef.current, control.getContainer())
                        //onRender can explicitly return null to force the grid to use native renderer
                        //useful if the custom component is required only for renderer, but not for editor or vice versa
                        if (result === null) {
                            return defaultRender();
                        }
                        return result;
                    }
                    return defaultRender();
                },
                onOverrideUnmount: (control, defaultUnmount) => {
                    if (valueRef.current.customComponent) {
                        const result = valueRef.current.customComponent.onUnmount(control.getContainer());
                        //onRender can explicitly return null to force the grid to use native renderer
                        //useful if the custom component is required only for renderer, but not for editor or vice versa
                        if (result === null) {
                            return defaultUnmount();
                        }
                        return result;
                    }
                    //@ts-ignore - internal types
                    //skip the unmounting for custom PCF's in Power Apps
                    // PCF unmount in Power Apps causes other nested PCF's to reinitialize which causes flickering
                    //umounting of nested PCF's happens on grid destroy to prevent memory leaks (currently done by refreshing the page as no better method was found)
                    if (control.isMountedPcfComponent() && !grid.getClient().isTalxisPortal()) {
                        return;
                    }
                    return defaultUnmount();
                },
                onOverrideControlProps: (controlProps) => {
                    //here we always need to fetch the latest parameters
                    //we still might have old one's cached in valueRef
                    const columnInfo = record.getColumnInfo(getColumn().name);
                    const parameters = columnInfo.ui.getControlParameters({
                        ...controlProps.parameters,
                        ...grid.getFieldBindingParameters(record, getColumn(), props.isCellEditor, recordCommands)
                    })
                    return {
                        ...controlProps,
                        context: {
                            ...controlProps.context,
                            mode: Object.create(controlProps.context.mode, {
                                allocatedHeight: {
                                    value: node.rowHeight! - 1
                                },

                            }),
                            parameters: parameters,
                            fluentDesignLanguage: getFluentDesignLanguage(controlProps.context.fluentDesignLanguage)
                        },
                        parameters: parameters
                    }
                }
            }
        }}
    />
}
