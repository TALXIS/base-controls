import { useMemo, useRef } from "react";
import { GridCellRendererModel } from "./GridCellRendererModel";
import { useControl } from "../../hooks";
import { Icon, Label, ThemeProvider, Text } from "@fluentui/react";
import { IGridCellRenderer } from "./interfaces";
import { getClassNames } from "@talxis/react-components";
import { getGridCellRendererStyles } from "./styles";
import { ValueRenderer } from "./ValueRenderer/ValueRenderer";
import { ModelContext } from "./useModel";

export const GridCellRenderer = (props: IGridCellRenderer) => {
    const { theme, labels, className, sizing } = useControl('GridCellRenderer', props);
    const propsRef = useRef<IGridCellRenderer>(props);
    propsRef.current = props;
    const model = useMemo(() => {
        return new GridCellRendererModel({
            getProps: () => propsRef.current,
            getControlTheme: () => theme,
            labels: labels,
        });
    }, []);
    const styles = getGridCellRendererStyles(model, sizing.height);
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);
    
    const componentProps = onOverrideComponentProps({
        onRender: (props, defaultRender) => defaultRender(props)
    })

    return (
        <ModelContext.Provider value={model}>
            {componentProps.onRender({
                container: {
                    className: getClassNames([className, styles.gridCellRendererRoot]),
                    title: model.getFormattedValue(),
                    theme: theme
                },
                onRenderContentContainer: (props, defaultRender) => defaultRender(props),
                onRenderAggregationLabel: (props, defaultRender) => defaultRender(props)
            }, (props) => {
                return (
                    <ThemeProvider {...props.container}>
                        {props.onRenderAggregationLabel({
                            children: model.getAggregationLabel(),
                            className: styles.aggregationLabel
                        }, (props) => {
                            if (model.getAggregationLabel()) {
                                return <Label {...props} />;
                            }
                            return <></>;
                        })}
                        {props.onRenderContentContainer({
                            container: {
                                className: styles.contentContainer
                            },
                            onRenderPrefixIcon: (props, defaultRender) => defaultRender(props),
                            onRenderSuffixIcon: (props, defaultRender) => defaultRender(props),
                            onRenderInnerContainer: (props, defaultRender) => defaultRender(props),
                        }, (props) => {
                            return (
                                <div {...props.container}>
                                    {props.onRenderPrefixIcon({
                                        ...model.getPrefixIconProps(),
                                    }, (props) => {
                                        if (model.getPrefixIconProps()) {
                                            return <Icon {...props} />;
                                        }
                                        return <></>;
                                    })}
                                    {props.onRenderInnerContainer({
                                        container: {
                                            className: styles.innerContentContainer
                                        },
                                        onRenderValueContainer: (props, defaultRender) => defaultRender(props),
                                        onRenderAggregatedValue: (props, defaultRender) => defaultRender(props)
                                    }, (props) => {
                                        return (
                                            <div {...props.container}>
                                                {props.onRenderValueContainer({
                                                    container: {
                                                        className: styles.valueContainer,
                                                        children: model.getFormattedValue()
                                                    },
                                                    onRenderValue: (props, defaultRender) => defaultRender(props)
                                                }, (props) => {
                                                    return (
                                                        <div {...props.container}>
                                                            {props.onRenderValue({
                                                                onRenderPlaceholder: (props, defaultRender) => defaultRender(props),
                                                                onRenderText: (props, defaultRender) => defaultRender(props),
                                                                onRenderLink: (props, defaultRender) => defaultRender(props),
                                                                onRenderColorfulOptionSet: (props, defaultRender) => defaultRender(props),
                                                                onRenderFile: (props, defaultRender) => defaultRender(props)
                                                            }, (props) => {
                                                                return (
                                                                    <ValueRenderer {...props}
                                                                    />
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                })}
                                                {props.onRenderAggregatedValue({
                                                    children: model.getFormattedAggregatedValue(),
                                                    className: styles.aggregatedValue,
                                                }, (props) => {
                                                    if (model.getFormattedAggregatedValue() !== null) {
                                                        return <Text {...props} />
                                                    }
                                                    return <></>
                                                })}
                                            </div>
                                        );
                                    })}
                                    {props.onRenderSuffixIcon({
                                        ...model.getSuffixIconProps()
                                    }, (props) => {
                                        if (model.getSuffixIconProps()) {
                                            return <Icon {...props} />
                                        }
                                        return <></>
                                    })}
                                </div>
                            );
                        })}
                    </ThemeProvider>
                );
            })}
        </ModelContext.Provider>
    );
};