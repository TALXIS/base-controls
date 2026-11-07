import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { NestedControl } from './NestedControl';
import { INestedControlRenderer, INestedControlRendererComponentProps, INestedControlRendererParameters } from './interfaces';
import { TextField } from '../text-field';
import { Decimal } from '../decimal';
import { Duration } from '../duration';
import { TwoOptions } from '../two-options';
import { DateTime } from '../date-time';
import { MultiSelectOptionSet } from '../multi-select-option-set';
import { Lookup } from '../lookup';
import { OptionSet } from '../option-set';
import { BaseControls } from "@pcf";
import { useLabels } from "@labels";
import { useRerender } from "@core";
import { getNestedControlRendererInternalStyles, getNestedControlStyles } from './ui/styles';
import { MessageBar, MessageBarButton, MessageBarType, SpinnerSize } from '@fluentui/react';
import { Spinner } from '@ui';
import { Shimmer } from '@ui';
import ReactDOM from 'react-dom';
import { NESTED_CONTROL_RENDERER_LABELS } from './labels';
import { Ribbon as LegacyRibbon } from '@legacy/ribbon';
import { getRegisteredBaseControl } from './registry';

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
    const { rerender } = useRerender();
    const isBaseControl = useMemo(() => {
        return BaseControls.IsBaseControl(props.parameters.ControlName);
    }, [props.parameters.ControlName]);

    const styles = useMemo(() => getNestedControlStyles(isBaseControl), [isBaseControl]);
    const internalControlRendererRef = useRef<INestedControlRendererInternalRef>(null);
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
            case 'Ribbon': {
                return LegacyRibbon;
            }
            //a name nobody recognises gets the plainest control there is rather than nothing at all
            default:
                return getRegisteredBaseControl(getRef().controlName) ?? getRegisteredBaseControl(BaseControls.GridValueRenderer) ?? (() => null);
        }
    };

    const onRender = (control: NestedControl, defaultRender: () => Promise<void>) => {
        //a base control is a child of this component, so React has already rendered it with the props
        //`refreshProps()` just produced - there is nothing to push into a container
        if (getRef().isBaseControl) {
            return;
        }
        return defaultRender();
    }

    const onUmount = (control: NestedControl, defaultUnmount: () => void) => {
        if (control.isMountedPcfComponent()) {
            return defaultUnmount();
        }
        //a base control lives in this component's tree, so React unmounts it with the rest of it
        if (getRef().isBaseControl) {
            return;
        }
        return ReactDOM.unmountComponentAtNode(control.getContainer())
    }

    const createControlInstance = () => {
        new NestedControl({
            parentPcfContext: getRef().props.context,
            getContainerElement: () => getRef().controlContainer!,
            getControlName: () => getRef().controlName,
            getBindings: () => {
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
                getControlStates: () => getRef().props.parameters.ControlStates,
                onNotifyOutputChanged: (outputs) => getRef().props.onNotifyOutputChanged?.(outputs)
            },
            overrides: {
                //read at the call, like its siblings: an override closes over the render that made it
                getProps: props => getRef().componentProps.onOverrideControlProps(props),
                onRender: (control: NestedControl, defaultRender) => {
                    getRef().componentProps.onOverrideRender(control, !getRef().isBaseControl, () => {
                        onRender(control, defaultRender);
                    })
                },
                onUnmount: (control, defaultUnmount) => {
                    getRef().componentProps.onOverrideUnmount(control, () => onUmount(control, defaultUnmount))
                },
                isLoading: () => getRef().componentProps.onOverrideIsLoading?.()
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

    return <NestedControlRendererInternal
        ref={internalControlRendererRef}
        control={getRef().control ?? undefined}
        baseControl={getRef().isBaseControl ? getBaseControl() : undefined}
        parameters={getRef().props.parameters}
        componentProps={getRef().componentProps} />
}

interface INestedControlRendererInternalProps {
    parameters: INestedControlRendererParameters;
    componentProps: INestedControlRendererComponentProps;
    loadingType?: 'spinner' | 'shimmer';
    control?: NestedControl;
    /** Set for base controls: rendered as a child of this component, instead of into the container. */
    baseControl?: React.ComponentType<any>;
}

interface INestedControlRendererInternalRef {
    getContainer: () => HTMLDivElement;
    rerender: () => void;
}


const NestedControlRendererInternal = forwardRef<INestedControlRendererInternalRef, INestedControlRendererInternalProps>((props, ref) => {
    //once control is defined, it is initialized
    const { control, parameters, componentProps, baseControl: BaseControl } = props;
    const labels = useLabels(NESTED_CONTROL_RENDERER_LABELS);
    const customControlContainerRef = useRef<HTMLDivElement>(null);
    const errorMessage = control?.getErrorMessage();
    const styles = useMemo(() => getNestedControlRendererInternalStyles(), []);
    const { rerender } = useRerender();

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
        <div className={styles.nestedControlContainer} {...componentProps.rootContainerProps}>
            {(!control || control.isLoading() || props.componentProps.onOverrideIsLoading?.()) && <div {...componentProps?.loadingProps?.containerProps}>{renderLoading()}</div>
            }
            {errorMessage &&
                <MessageBar messageBarType={MessageBarType.error} isMultiline={false} actions={<div>
                    <MessageBarButton className={componentProps.messageBarProps.buttonProps.className} onClick={() => onShowErrorDialog()}>{labels.get('nestedControlRenderer.detail')}</MessageBarButton>
                </div>} {...componentProps?.messageBarProps}>
                    {labels.get('nestedControlRenderer.control')} <b>{parameters.ControlName}</b> {labels.get('nestedControlRenderer.failedToLoad')}.
                </MessageBar>
            }
            <div className={styles.nestedControl} ref={customControlContainerRef} style={errorMessage ? { display: 'none' } : undefined} {...componentProps.controlContainerProps}>
                {/* base controls only. Props are read during render so this pass shows the current ones,
                    rather than the previous ones a container render would have left behind */}
                {BaseControl && control && React.createElement(BaseControl, control.refreshProps())}
            </div>
        </div>)
})
