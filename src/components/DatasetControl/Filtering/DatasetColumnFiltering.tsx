import { DefaultButton, DirectionalHint, PrimaryButton, ThemeProvider } from "@fluentui/react";
import { useControl } from "../../../hooks"
import { OptionSet } from "../../OptionSet";
import { IDatasetColumnFiltering } from "./interfaces";
import { datasetColumnFilteringTranslations } from "./translations";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DatasetColumnFilteringModel } from "./DatasetColumnFilteringModel";
import { useRerender } from "@talxis/react-components";
import { NestedControlRenderer } from "../../NestedControlRenderer";
import React from "react";
import { getDatasetColumnFilteringStyles } from "./styles";
import { useDebouncedCallback } from "use-debounce";
import { Type as FilterType } from "@talxis/client-libraries";

export const DatasetColumnFiltering = (props: IDatasetColumnFiltering) => {
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);
    const { labels, theme, onNotifyOutputChanged } = useControl('DatasetFiltering', props, datasetColumnFilteringTranslations);
    const context = props.context;
    const filtering = props.parameters.Filtering;
    const columnFilter = props.parameters.Filtering.getColumnFilter(props.parameters.ColumnName.raw!);
    //automatically create a condition if it's not present
    if (columnFilter.getConditions().length === 0) {
        columnFilter.addCondition();
    }
    //this is the first condition, we assume that the control is used for a single condition
    const condition = columnFilter.getConditions()[0];
    const rerender = useRerender();
    const [shouldRemountValueControl, setShouldRemountValueControl] = useState(false);

    const onOperatorChanged = useCallback(() => {
        setShouldRemountValueControl(true);
    }, []);

    const isClearButtonDisabled = () => {
        if (condition.isValueLoading()) {
            return true;
        }
        return model.getConditionValue().every(value => {
            return value == null;
        });
    }
    const onSave = () => {
        const result = filtering.getFilterExpression(FilterType.And.Value);
        if (!result) {
            rerender();
        }
        else {
            onNotifyOutputChanged(result)
        }
    }

    const onClear = () => {
        condition.setValue(null);
        setShouldRemountValueControl(true);
    }

    const debouncedSetConditionControlValue = useDebouncedCallback((value, index) => {
        model.setConditionValue(value, index);
    })

    const model = useMemo(() => {
        condition.addEventListener('onOperatorChanged', onOperatorChanged);
        condition.addEventListener('onValueChanged', rerender);
        return new DatasetColumnFilteringModel(condition, labels)
    }, []);

    const conditionValue = model.getConditionValue();
    const validationResult = condition.getValidationResult();
    const styles = useMemo(() => getDatasetColumnFilteringStyles(), []);

    const componentProps = onOverrideComponentProps({
        onRender: (props, defaultRender) => defaultRender(props),
    })

    useEffect(() => {
        if (shouldRemountValueControl) {
            setShouldRemountValueControl(false);
        }
    }, [shouldRemountValueControl])

    return componentProps.onRender({
        container: {
            theme: theme,
            className: styles.datasetColumnFilteringRoot
        },
        valueControlsContainer: {
            className: styles.valueControlsContainer
        },
        onRenderConditionOperatorControl: (props, defaultRender) => defaultRender(props),
        onRenderConditionValueControl: (props, defaultRender) => defaultRender(props),
        onRenderButtons: (props, defaultRender) => defaultRender(props),

    }, (props) => {
        return <ThemeProvider {...props.container}>
            {props.onRenderConditionOperatorControl({
                context: context,
                //@ts-ignore - typings
                onNotifyOutputChanged: (outputs) => condition.setOperator(outputs.value),
                parameters: {
                    value: {
                        raw: condition.getOperator(),
                        //@ts-ignore - typings
                        attributes: {
                            Options: model.getOperatorOptionSet()
                        }
                    }
                },
            }, (props) => <OptionSet {...props} />)}
            <div {...props.valueControlsContainer}>
                {!shouldRemountValueControl &&
                    <>
                        {
                            conditionValue.map((value, index) => {
                                return <React.Fragment key={index}>
                                    {props.onRenderConditionValueControl({
                                        context: context,
                                        onOverrideComponentProps: (props) => {
                                            return {
                                                ...props,
                                                onOverrideIsLoading: () => condition.isValueLoading()
                                            }
                                        },
                                        parameters: {
                                            ControlName: model.getControlName()!,
                                            LoadingType: 'shimmer',
                                            Bindings: {
                                                value: {
                                                    isStatic: false,
                                                    value: value,
                                                    type: condition.getDataType() ?? 'SingleLine.Text',
                                                    error: validationResult[index].error,
                                                    errorMessage: validationResult[index].errorMessage,
                                                    metadata: {
                                                        onOverrideMetadata: () => {
                                                            return {
                                                                ...condition.getMetadata()
                                                            }
                                                        }
                                                    },
                                                    onNotifyOutputChanged: (value) => debouncedSetConditionControlValue(value, index)
                                                },
                                                AutoFocus: {
                                                    isStatic: true,
                                                    value: index === 0 && conditionValue.length === 1,
                                                    type: 'TwoOptions'
                                                },
                                                ShowErrorMessage: {
                                                    isStatic: true,
                                                    value: true,
                                                    type: 'TwoOptions'
                                                },
                                                ...condition.getBindings()
                                            }
                                        }
                                    }, (props) => {
                                        if (!model.getControlName()) {
                                            return <></>
                                        }
                                        return <NestedControlRenderer {...props} />
                                    })}
                                </React.Fragment>
                            })
                        }
                    </>
                }
            </div>
            {props.onRenderButtons({
                container: {
                    className: styles.buttons
                },
                onRenderApplyButton: (props, defaultRender) => defaultRender(props),
                onRenderClearButton: (props, defaultRender) => defaultRender(props)
            }, (props) => {
                return <div {...props.container}>
                    {props.onRenderApplyButton({
                        text: 'Apply',
                        disabled: condition.isValueLoading(),
                        onClick: onSave,
                    }, (props) => <PrimaryButton {...props} />)}
                    {props.onRenderClearButton({
                        text: 'Clear',
                        disabled: isClearButtonDisabled(),
                        onClick: onClear
                    }, (props) => <DefaultButton
                        {...props} />)}
                </div>
            })}
        </ThemeProvider>
    })
}