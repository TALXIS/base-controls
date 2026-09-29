import { useEffect, useMemo, useRef } from "react";
import { Ribbon } from "@controls/dataset-control/ribbon";
import { IGridInlineRibbon } from "./interfaces"
import { GridInlineRibbonModel, IGridInlineRibbonModelEvents } from "./GridInlineRibbonModel";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { useRerender, useResizeObserver } from "@legacy";
import { getClassNames } from "@utils";
import { ICommandBar } from "@fluentui/react";
import { getGridInlineRibbonStyles } from "./styles";
import { DataProvider } from "@talxis/client-libraries";

const MODEL_EVENTS: (keyof IGridInlineRibbonModelEvents)[] = ['onBeforeCommandsRefresh', 'onAfterCommandsRefresh'];

export const GridInlineRibbon = (props: IGridInlineRibbon) => {
    const propsRef = useRef(props);
    propsRef.current = props;
    const context = props.context;
    const record = props.parameters.Record.raw;
    //one model per record: a reload can hand the same row a new one
    const model = useMemo(() => new GridInlineRibbonModel({
        onGetDataset: () => propsRef.current.parameters.Dataset.raw,
        onGetRecord: () => record,
        onGetCommandButtonIds: () => propsRef.current.parameters.CommandButtonIds?.raw?.split(',').map(id => id.trim()) ?? []
    }), [record]);
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);
    const componentProps = onOverrideComponentProps({
        onRender: (props, defaultRender) => defaultRender(props)
    })
    const commandBarRef = useRef<ICommandBar>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const rerender = useRerender();
    const styles = useMemo(() => getGridInlineRibbonStyles(props.parameters.Record.raw.getDataProvider().getColumnsMap()[DataProvider.CONST.RIBBON_BUTTONS_COLUMN_NAME].alignment ?? 'left', context.mode.allocatedHeight), [context.mode.allocatedHeight]);
    useEventEmitter<IGridInlineRibbonModelEvents>(model, MODEL_EVENTS, () => rerender());

    const observe = useResizeObserver(() => {
        commandBarRef.current?.remeasure();
    })

    useEffect(() => {
        const ribbonField = record.getField(DataProvider.CONST.RIBBON_BUTTONS_COLUMN_NAME);
        ribbonField.setCustomProperty('isRibbonUiMounted', true);
        model.refreshCommands();
        return () => {
            if (!record.getDataProvider().isDestroyed()) {
                ribbonField.setCustomProperty('isRibbonUiMounted', false);
            }
            model.destroy();
        }
    }, [model]);

    useEffect(() => {
        if (containerRef.current) {
            observe(containerRef.current);
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