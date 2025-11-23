import { useEffect, useMemo, useRef } from "react";
import { Ribbon } from "../Ribbon/Ribbon";
import { IGridInlineRibbon } from "./interfaces"
import { GridInlineRibbonModel, IGridInlineRibbonModelEvents } from "./GridInlineRibbonModel";
import { useEventEmitter } from "../../hooks/useEventEmitter";
import { getClassNames, useRerender, useResizeObserver } from "@talxis/react-components";
import { ICommandBar } from "@fluentui/react";
import { getGridInlineRibbonStyles } from "./styles";
import { DataProvider } from "@talxis/client-libraries";

export const GridInlineRibbon = (props: IGridInlineRibbon) => {
    const propsRef = useRef(props);
    propsRef.current = props;
    const context = props.context;
    const model = useMemo(() => new GridInlineRibbonModel({
        onGetRecord: () => propsRef.current.parameters.Record.raw,
        onGetCommandButtonIds: () => propsRef.current.parameters.CommandButtonIds?.raw?.split(',').map(id => id.trim()) ?? []
    }), []);
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);
    const componentProps = onOverrideComponentProps({
        onRender: (props, defaultRender) => defaultRender(props)
    })
    const commandBarRef = useRef<ICommandBar>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const rerender = useRerender();
    const styles = useMemo(() => getGridInlineRibbonStyles(props.parameters.Record.raw.getDataProvider().getColumnsMap()[DataProvider.CONST.RIBBON_BUTTONS_COLUMN_NAME].alignment, context.mode.allocatedHeight), [context.mode.allocatedHeight]);
    useEventEmitter<IGridInlineRibbonModelEvents>(model, ['onBeforeCommandsRefresh', 'onAfterCommandsRefresh'], () => rerender());

    const observe = useResizeObserver(() => {
        commandBarRef.current?.remeasure();
    })

    const getRibbonColumn = () => {
        return props.parameters.Record.raw.getField(DataProvider.CONST.RIBBON_BUTTONS_COLUMN_NAME);
    }

    useEffect(() => {
        getRibbonColumn().setCustomProperty('isRibbonUiMounted', true);
        model.refreshCommands();
        if (containerRef.current) {
            observe(containerRef.current);
        }
        return () => {
            if (!props.parameters.Record.raw.getDataProvider().isDestroyed()) {
                getRibbonColumn().setCustomProperty('isRibbonUiMounted', false);
            }
            model.destroy();
        }
    }, []);

    return componentProps.onRender({
        container: {
            className: styles.gridInlineRibbonRoot,
            ref: containerRef
        },
        onRenderRibbon: (props, defaultRender) => defaultRender(props),

    }, (props) => {
        return <div {...props.container}>
            <Ribbon
                context={{
                    ...context,
                    mode: {
                        ...context.mode,
                        isControlDisabled: false
                    }
                }}
                parameters={{
                    Commands: {
                        raw: model.getCommands()
                    },
                    Loading: {
                        raw: model.isLoading()
                    }
                }}
                onOverrideComponentProps={() => {
                    return {
                        onRender: (ribbonProps, defaultRender) => {
                            return props.onRenderRibbon(ribbonProps, (props) => {
                                return defaultRender({
                                    ...props,
                                    container: {
                                        ...props.container,
                                        className: getClassNames([props.container.className, styles.ribbonContainer])
                                    },
                                    onRenderLoading: (loadingProps, defaultRender) => {
                                        return props.onRenderLoading(loadingProps, (props) => {
                                            return defaultRender({
                                                ...props,
                                                styles: {
                                                    ...props.styles,
                                                    //@ts-ignore - typings
                                                    root: getClassNames([(props.styles?.root), styles.shimmerRoot]),
                                                    //@ts-ignore - typings
                                                    shimmerWrapper: getClassNames([props.styles?.shimmerWrapper, styles.shimmerWrapper])
                                                }
                                            })
                                        })
                                    },
                                    onRenderCommandBar: (commandBarProps, defaultRender) => {
                                        return props.onRenderCommandBar(commandBarProps, (props) => {
                                            return defaultRender({
                                                ...props,
                                                componentRef: commandBarRef,
                                                styles: {
                                                    ...props.styles,
                                                    //@ts-ignore - typings
                                                    primarySet: getClassNames([props.styles?.primarySet, styles.primarySet])
                                                },
                                            })
                                        })
                                    }
                                })
                            })
                        }
                    }
                }}
            />
        </div>
    })
}