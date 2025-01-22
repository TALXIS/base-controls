import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { NestedControl } from './NestedControl';
import { INestedControlRenderer, INestedControlRendererComponentProps, INestedControlRendererParameters } from './interfaces';
import { TextField } from '../TextField';
import { IControl } from '../../interfaces';
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
import { Shimmer, SpinnerSize } from '@fluentui/react';

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

    componentPropsRef.current = onOverrideComponentProps({
        rootContainerProps: {},
        controlContainerProps: {},
        loadingProps: {
            containerProps: {},
            spinnerProps: {
                size: SpinnerSize.xSmall
            },
            shimmerProps: {
                styles: {
                    root: styles.shimmerRoot,
                }
            },
        },
        onOverrideControlProps: () => { return (props) => props },
    })

    //if the ref is set, the control has been initialized
    if (controlRef.current) {
        controlRef.current?.render();
    }
    const createControlInstance = () => {
        const instance = new NestedControl({
            containerElement: internalControlRendererRef.current?.getContainer()!,
            parentPcfContext: propsRef.current.context,
            onGetControlName: () => propsRef.current.parameters.ControlName,
            onGetBindings: () => {
                return propsRef.current.parameters.Bindings;
            },
            callbacks: {
                onInit: () => {
                    controlRef.current = instance;
                    rerender();
                },
                onControlLoaded: () => internalControlRendererRef.current?.rerender(),
                onGetControlStates: () => propsRef.current.parameters.ControlStates,
            },
            overrides: {
                onGetProps: componentPropsRef.current?.onOverrideControlProps,
                onRender: () => {
                    if (BaseControls.IsBaseControl(propsRef.current.parameters.ControlName)) {
                        return () => { }
                    }
                    return undefined;
                },
                onUnmount: () => {
                    if (BaseControls.IsBaseControl(propsRef.current.parameters.ControlName)) {
                        return () => { }
                    }
                    return undefined;
                }
            }
        })
    }

    React.useEffect(() => {
        createControlInstance();
        return () => {
            controlRef.current?.unmount();
        }
    }, []);

    return <InternalNestedControlRenderer
        ref={internalControlRendererRef}
        control={controlRef.current}
        parameters={propsRef.current.parameters}
        componentProps={componentPropsRef.current}
        isBaseControl={isBaseControl} />
}

interface IInternalNestedControlRendererProps {
    isBaseControl: boolean;
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
    const { control, isBaseControl, parameters, componentProps } = props;
    const customControlContainerRef = useRef<HTMLDivElement>(null);
    const rerender = useRerender();

    useImperativeHandle(ref, () => {
        return {
            getContainer: () => customControlContainerRef.current!,
            rerender: () => rerender()
        }
    })

    const renderBaseControl = (controlProps: IControl<any, any, any, any>) => {
        switch (parameters.ControlName) {
            case 'TextField':
                return <TextField {...controlProps} />
            case 'OptionSet':
                return <OptionSet {...controlProps} />
            case 'Lookup':
                return <Lookup {...controlProps} />
            case 'MultiSelectOptionSet':
                return <MultiSelectOptionSet {...controlProps} />
            case 'TwoOptions':
                return <TwoOptions {...controlProps} />
            case 'DateTime':
                return <DateTime {...controlProps} />
            case 'Decimal':
                return <Decimal {...controlProps} />
            case 'Duration':
                return <Duration {...controlProps} />;
            case 'GridCellRenderer':
                return <GridCellRenderer {...controlProps} />
            default:
                return null;
        }
    };

    const renderLoading = () => {
        if (parameters.LoadingType === 'shimmer') {
            return <Shimmer {...componentProps.loadingProps.shimmerProps} />
        }
        return <Spinner {...componentProps.loadingProps.spinnerProps} />
    }

    return (
        <div {...componentProps.rootContainerProps}>
            {(!control || control.isLoading()) && <div {...componentProps.loadingProps.containerProps}>{renderLoading()}</div>
            }
            {control && isBaseControl && renderBaseControl(control.getProps())}
            <div ref={customControlContainerRef} {...componentProps.controlContainerProps} />
        </div>)
})
