import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
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
import { BaseControls } from '../../utils';
import { getNestedControlStyles } from './styles';
import { Spinner, useRerender } from '@talxis/react-components';
import { MessageBar, MessageBarButton, MessageBarType, Shimmer, SpinnerSize } from '@fluentui/react';
import ReactDOM from 'react-dom';
import { useControlLabels } from '../../hooks';
import { getDefaultNestedControlRendererTranslations } from './translations';

interface IRef {
    control: NestedControl | null;
    props: INestedControlRenderer;
    controlName: string;
    componentProps: INestedControlRendererComponentProps;
    isBaseControl: boolean;
    mounted: boolean;
    controlContainer: HTMLDivElement | null;
}

export const NestedControlRenderer = (props: INestedControlRenderer) => {
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);
    const labels = useControlLabels({
        translations: props.translations,
        languageId : props.context.userSettings.languageId,
        defaultTranslations: getDefaultNestedControlRendererTranslations()
    })
    const rerender = useRerender();
    const isBaseControl = useMemo(() => {
        return BaseControls.IsBaseControl(props.parameters.ControlName);
    }, [props.parameters.ControlName]);

    const styles = useMemo(() => getNestedControlStyles(isBaseControl), [isBaseControl]);
    const internalControlRendererRef = useRef<IInternalNestedControlRendererRef>(null);
    const ref = useRef<Partial<IRef>>();
    
    ref.current = {
        ...ref.current,
        props: props,
        isBaseControl: isBaseControl,
        controlName: props.parameters.ControlName 
    }

    ref.current.componentProps = onOverrideComponentProps({
        rootContainerProps: {},
        controlContainerProps: {},
        messageBarProps: {
            //@ts-ignore - typescript
            messageBarType: MessageBarType.error,
            buttonProps: {
                className: styles.messageBarBtn
            }
        },
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
        onOverrideRender: (control, isCustomPcfComponent, defaultRender) => defaultRender(),
        onOverrideUnmount: (control, defaultUnmount) => defaultUnmount(),
        onOverrideControlProps: (props) => props,
    });

    const getRef = (): IRef => {
        return ref.current as any;
    }

    const getBaseControl = (): any => {
        switch (getRef().controlName) {
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

    const onRender = (control: NestedControl, defaultRender: () => Promise<void>) => {
        if (getRef().isBaseControl) {
            const controlProps = control.getProps();
            return ReactDOM.render(React.createElement(getBaseControl(), controlProps), control.getContainer());
        }
        return defaultRender();
    }

    const onUmount = (control: NestedControl, defaultUnmount: () => void) => {
        if (control.isMountedPcfComponent()) {
            return defaultUnmount();
        }
        return ReactDOM.unmountComponentAtNode(control.getContainer())
    }

    const createControlInstance = () => {
        new NestedControl({
            parentPcfContext: getRef().props.context,
            onGetContainerElement: () => getRef().controlContainer!,
            onGetControlName: () => getRef().controlName,
            onGetBindings: () => {
                return getRef().props.parameters.Bindings ?? {};
            },
            callbacks: {
                //onInit could either by sync or async
                onInit: (instance) => {
                    getRef().control = instance;
                    //if we are already mounted, we need to rerender
                    if (getRef().mounted) {
                        rerender();
                    }
                },
                onControlStateChanged: () => internalControlRendererRef.current?.rerender(),
                onGetControlStates: () => getRef().props.parameters.ControlStates,
                onNotifyOutputChanged: (outputs) => getRef().props.onNotifyOutputChanged?.(outputs)
            },
            overrides: {
                onGetProps: getRef().componentProps.onOverrideControlProps,
                onRender: (control: NestedControl, defaultRender) => {
                    getRef().componentProps.onOverrideRender(control, !getRef().isBaseControl, () => {
                        onRender(control, defaultRender);
                    })
                },
                onUnmount: (control, defaultUnmount) => {
                    getRef().componentProps.onOverrideUnmount(control, () => onUmount(control, defaultUnmount))
                }
            },
        })

    }
    useMemo(() => {
        createControlInstance();
    }, []);

    useEffect(() => {
        const ref = getRef();
        ref.mounted = true;
        ref.controlContainer = internalControlRendererRef.current!.getContainer();
        return () => {
            const ref = getRef();
            ref.control?.unmount();
            ref.controlContainer = null;
            ref.control = null;
        }
    }, []);

    useEffect(() => {
        getRef().control?.render();
    })

    return <InternalNestedControlRenderer
        ref={internalControlRendererRef}
        labels={labels}
        control={getRef().control ?? undefined}
        parameters={getRef().props.parameters}
        componentProps={getRef().componentProps} />
}

interface IInternalNestedControlRendererProps {
    parameters: INestedControlRendererParameters;
    componentProps: INestedControlRendererComponentProps;
    labels: any;
    loadingType?: 'spinner' | 'shimmer';
    control?: NestedControl;

}

interface IInternalNestedControlRendererRef {
    getContainer: () => HTMLDivElement;
    rerender: () => void;
}


const InternalNestedControlRenderer = forwardRef<IInternalNestedControlRendererRef, IInternalNestedControlRendererProps>((props, ref) => {
    //once control is defined, it is initialized
    const { control, parameters, componentProps, labels } = props;
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

    const onShowErrorDialog = () => {
        if(window.Xrm?.Navigation) {
            window.Xrm.Navigation.openErrorDialog({
                message: errorMessage
            })
            return;
        }
        alert(errorMessage);
    }

    return (
        <div {...componentProps.rootContainerProps}>
            {(!control || control.isLoading()) && <div {...componentProps?.loadingProps?.containerProps}>{renderLoading()}</div>
            }
            {errorMessage &&
                <MessageBar messageBarType={MessageBarType.error} isMultiline={false} actions={<div>
                    <MessageBarButton className={componentProps.messageBarProps.buttonProps.className} onClick={() => onShowErrorDialog()}>{labels.detail()}</MessageBarButton>
                </div>} {...componentProps?.messageBarProps}>
                    {labels.control()} <b>{parameters.ControlName}</b> {labels.failedToLoad()}.
                </MessageBar>
            }
            <div ref={customControlContainerRef} {...componentProps.controlContainerProps} />
        </div>)
})
