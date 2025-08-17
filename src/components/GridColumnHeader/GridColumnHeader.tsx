import { CommandBarButton, ThemeProvider, Text, Icon } from "@fluentui/react";
import { useControl } from "../../hooks";
import { IGridColumnHeader } from "./interfaces";
import { useMemo, useRef } from "react";
import { GridColumnHeaderModel } from "./GridColumnHeaderModel";
import { getGridColumnHeaderStyles } from "./styles";
import { Autosum20Regular, GroupList20Regular, GroupList24Regular, GroupListRegular } from "@fluentui/react-icons";
import { gridColumnHeaderTranslations } from "./translations";

export const GridColumnHeader = (props: IGridColumnHeader) => {
    const { theme, labels } = useControl('GridColumnHeader', props, gridColumnHeaderTranslations);
    const propsRef = useRef<IGridColumnHeader>(props);
    propsRef.current = props;

    const model = useMemo(() => new GridColumnHeaderModel({
        getLabels: () => labels,
        getProps: () => propsRef.current
    }), []);
    const styles = useMemo(() => getGridColumnHeaderStyles(theme, model.getColumn().alignment!), [
        theme,
        model.getColumn().alignment!
    ]);
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);

    const componentProps = onOverrideComponentProps({
        onRender: (props, defaultRender) => defaultRender(props)
    })

    const getSortIconName = () => {
        if (model.isSortedAsc()) {
            return 'SortUp';
        } else if (model.isSortedDesc()) {
            return 'SortDown';
        }
        return undefined;
    }

    const getTitle = () => {
        let title = model.getColumn().displayName;
        if (model.isAggregated()) {
            title += ` (${model.getAggregationLabel()})`;
        }
        return title;
    }

    return componentProps.onRender({
        container: {
            theme: theme
        },
        onRenderCommandBarButton: (props, defaultRender) => defaultRender(props),
    }, (props) => {
        return <ThemeProvider {...props.container}>
            {props.onRenderCommandBarButton({
                buttonProps: {
                    styles: {
                        root: styles.commandBarButtonRoot,
                    },
                    title: getTitle()
                },
                onRenderColumnDisplayNameContainer: (props, defaultRender) => defaultRender(props),
                onRenderSuffixIconContainer: (props, defaultRender) => defaultRender(props),
            }, (props) => {
                return <CommandBarButton {...props.buttonProps}>
                    {props.onRenderColumnDisplayNameContainer({
                        container: {
                            className: styles.columnDisplayNameContainer
                        },
                        onRenderColumnDisplayName: (props, defaultRender) => defaultRender(props),
                        onRenderRequiredSymbol: (props, defaultRender) => defaultRender(props),
                        onRenderGroupingIcon: (props, defaultRender) => defaultRender(props),

                    }, (props) => {
                        return <div {...props.container}>
                            {props.onRenderGroupingIcon({
                                className: `${styles.svgIcon}`
                            }, (props) => {
                                if (model.isGrouped()) {
                                    return <GroupList20Regular {...props} />
                                }
                                return <></>
                            })}
                            {props.onRenderColumnDisplayName({
                                children: model.getColumn().displayName,
                                styles: {
                                    root: styles.columnDisplayNameText
                                }
                            }, (props) => {
                                return <Text {...props} />
                            })}
                            {props.onRenderRequiredSymbol({
                                children: '*',
                                className: styles.asterix
                            }, (props) => {
                                if (model.isRequired()) {
                                    return <Text {...props} />
                                }
                                return <></>
                            })}
                        </div>
                    })}
                    {props.onRenderSuffixIconContainer({
                        container: {
                            className: styles.suffixIconsContainer
                        },
                        onRenderFilterIcon: (props, defaultRender) => defaultRender(props),
                        onRenderSortIcon: (props, defaultRender) => defaultRender(props),
                        onRenderUneditableIcon: (props, defaultRender) => defaultRender(props),
                        onRenderSumIcon: (props, defaultRender) => defaultRender(props),
                    }, (props) => {
                        return <div {...props.container}>
                            {props.onRenderSortIcon({
                                iconName: getSortIconName()
                            }, (props) => {
                                if (props.iconName) {
                                    return <Icon {...props} />
                                }
                                return <></>
                            })}
                            {props.onRenderFilterIcon({
                                iconName: 'Filter'
                            }, (props) => {
                                if (model.isFiltered()) {
                                    return <Icon {...props} />
                                }
                                return <></>
                            })}
                            {props.onRenderUneditableIcon({
                                iconName: 'Uneditable'
                            }, (props) => {
                                if (model.isUneditableIconVisible()) {
                                    return <Icon {...props} />
                                }
                                return <></>
                            })}
                            {props.onRenderSumIcon({
                                className: `${styles.svgIcon} ${styles.aggregationIcon}`
                            }, (props) => {
                                if (model.isAggregated()) {
                                    return <Autosum20Regular {...props} />
                                }
                                return <></>
                            })}
                        </div>
                    })}
                </CommandBarButton>
            })}
        </ThemeProvider>
    })

}