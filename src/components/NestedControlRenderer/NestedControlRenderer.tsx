import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { NestedControl } from './NestedControl';
import { INestedControlRenderer, INestedControlRendererComponentProps, INestedControlRendererParameters } from './interfaces';
import { TextField } from '../TextField';
import { Decimal } from '../Decimal';
import { Duration } from '../Duration';
import { TwoOptions } from '../TwoOptions';
import { DateTime } from '../DateTime';
import { MultiSelectOptionSet } from '../MultiSelectOptionSet';
import { Lookup } from '../Lookup';
import { OptionSet } from '../OptionSet';
import { GridCellRenderer } from '../GridCellRenderer/GridCellRenderer';
import { BaseControls, ThemeWrapper } from '../../utils';
import { getNestedControlStyles } from './styles';
import { Spinner, useRerender } from '@talxis/react-components';
import { MessageBar, MessageBarButton, MessageBarType, Rating, Shimmer, SpinnerSize } from '@fluentui/react';
import ReactDOM from 'react-dom';
import { IControl } from '../../interfaces';

export const NestedControlRenderer = (__props: INestedControlRenderer) => {
    const controlRef = useRef<NestedControl>();
    const internalControlRendererRef = useRef<IInternalNestedControlRendererRef>(null);
    const propsRef = useRef<INestedControlRenderer>({} as any);
    propsRef.current = __props;
    const onOverrideComponentProps = __props.onOverrideComponentProps ?? ((props) => props);
    const rerender = useRerender();
    const isBaseControl = useMemo(() => {
        return BaseControls.IsBaseControl(propsRef.current.parameters.ControlName);
    }, [propsRef.current.parameters.ControlName]);

    const styles = useMemo(() => getNestedControlStyles(isBaseControl), [isBaseControl]);
    const componentPropsRef = useRef<INestedControlRendererComponentProps>();
    const mountedRef = useRef(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    componentPropsRef.current = onOverrideComponentProps({
        rootContainerProps: {},
        controlContainerProps: {},
        messageBarProps: {
            messageBarType: MessageBarType.error,
        },
        overridenControlContainerProps: {},
        loadingProps: {
            containerProps: {},
            spinnerProps: {
                size: SpinnerSize.xSmall
            },
            shimmerProps: {
                styles: {
                    root: styles.shimmerRoot,
                    shimmerWrapper: {
                        height: 32
                    }
                }
            },
        },
        onOverrideRender: (props, defaultRender) => defaultRender(),
        onOverrideControlProps: (props) => props,
    })

    const getBaseControl = (): any => {
        switch (propsRef.current.parameters.ControlName) {
            case 'TextField':
                return TextField
            case 'OptionSet':
                return OptionSet;
            case 'Lookup':
                return Lookup;
            case 'MultiSelectOptionSet':
                return MultiSelectOptionSet;
            case 'TwoOptions':
                return TwoOptions;
            case 'DateTime':
                return DateTime;
            case 'Decimal':
                return Decimal;
            case 'Duration':
                return Duration;
            case 'GridCellRenderer':
                return GridCellRenderer;
            default:
                return GridCellRenderer;
        }
    };

    const onRender = (controlProps: IControl<any, any, any, any>, container: HTMLDivElement, defaultRender: () => Promise<void>, componentToRender?: React.ReactElement) => {
        if (!componentToRender && BaseControls.IsBaseControl(propsRef.current.parameters.ControlName)) {
            componentToRender = React.createElement(getBaseControl(), controlProps);
        }
        if (componentToRender) {
            return ReactDOM.render(React.createElement(
                ThemeWrapper,
                {
                    ...componentPropsRef.current?.overridenControlContainerProps,
                    fluentDesignLanguage: controlProps.context.fluentDesignLanguage
                },
                componentToRender
            ), container);
        }
        return defaultRender();
    }

    const createControlInstance = () => {
        new NestedControl({
            parentPcfContext: propsRef.current.context,
            onGetContainerElement: () => containerRef.current!,
            onGetControlName: () => propsRef.current.parameters.ControlName,
            onGetBindings: () => {
                return propsRef.current.parameters.Bindings ?? {};
            },
            callbacks: {
                //onInit could either by sync or async
                onInit: (instance) => {
                    controlRef.current = instance;
                    //if we are already mounted, we need to rerender
                    if (mountedRef.current) {
                        rerender();
                    }
                },
                onControlStateChanged: () => internalControlRendererRef.current?.rerender(),
                onGetControlStates: () => propsRef.current.parameters.ControlStates,
                onNotifyOutputChanged: (outputs) => propsRef.current.onNotifyOutputChanged?.(outputs)
            },
            overrides: {
                onGetProps: componentPropsRef.current?.onOverrideControlProps,
                onRender: (controlProps, container, defaultRender) => {
                    const component = componentPropsRef.current?.onOverrideRender!(controlProps, () => { })
                    return onRender(controlProps, container, defaultRender, component ?? undefined);
                },
                onUnmount: (isPcfComponent, container, defaultUnmount) => {
                    if (isPcfComponent) {
                        return defaultUnmount();
                    }
                    ReactDOM.unmountComponentAtNode(container);
                }
            }
        })

    }
    useMemo(() => {
        createControlInstance();
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        containerRef.current = internalControlRendererRef.current!.getContainer()
        return () => {
            controlRef.current?.unmount();
            containerRef.current = null;
            controlRef.current = undefined;
        }
    }, []);

    useEffect(() => {
        //if the ref is set, the control has been initialized
        if (controlRef.current) {
            controlRef.current?.render();
        }
    })

    return <InternalNestedControlRenderer
        ref={internalControlRendererRef}
        control={controlRef.current}
        parameters={propsRef.current.parameters}
        componentProps={componentPropsRef.current} />
}

interface IInternalNestedControlRendererProps {
    parameters: INestedControlRendererParameters;
    componentProps: INestedControlRendererComponentProps;
    loadingType?: 'spinner' | 'shimmer';
    control?: NestedControl;

}

interface IInternalNestedControlRendererRef {
    getContainer: () => HTMLDivElement;
    rerender: () => void;
}


const InternalNestedControlRenderer = forwardRef<IInternalNestedControlRendererRef, IInternalNestedControlRendererProps>((props, ref) => {
    //once control is defined, it is initialized
    const { control, parameters, componentProps } = props;
    const customControlContainerRef = useRef<HTMLDivElement>(null);
    const errorMessage = control?.getErrorMessage();
    const rerender = useRerender();

    useImperativeHandle(ref, () => {
        return {
            getContainer: () => customControlContainerRef.current!,
            rerender: () => rerender()
        }
    })

    const renderLoading = () => {
        if (parameters.LoadingType === 'shimmer') {
            return <Shimmer {...componentProps?.loadingProps?.shimmerProps} />
        }
        return <Spinner {...componentProps?.loadingProps?.spinnerProps} />
    }
    return (
        <div {...componentProps.rootContainerProps}>
            {(!control || control.isLoading()) && <div {...componentProps?.loadingProps?.containerProps}>{renderLoading()}</div>
            }
            {errorMessage &&
                <MessageBar messageBarType={MessageBarType.error} isMultiline={false} actions={<div>
                    <MessageBarButton onClick={() => window.Xrm.Navigation.openErrorDialog({
                        message: errorMessage
                    })}>Details</MessageBarButton>
                </div>} {...componentProps?.messageBarProps}>
                    Component <b>{parameters.ControlName}</b> failed to load.
                </MessageBar>
            }
            <div ref={customControlContainerRef} {...componentProps.controlContainerProps} />
        </div>)
})
