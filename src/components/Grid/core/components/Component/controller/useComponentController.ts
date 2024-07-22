import { useEffect, useMemo,useRef,useState } from "react"
import { IComponentProps } from "../Component";
import { Component } from '../model/Component';
import { useGridInstance } from "../../../hooks/useGridInstance";
import { IComponent } from "../../../../../../interfaces/context";
import { IGridColumn } from "../../../interfaces/IGridColumn";

interface IComponentController {
    column: IGridColumn;
    componentProps: IComponent<any, any, any, any>;
}

export const useComponentController = (props: IComponentProps): IComponentController | undefined => {
    const grid = useGridInstance();
    const component = useMemo(() => new Component(grid), []);
    const [controller, setController] = useState<IComponentController>();
    const mountedRef = useRef<boolean>(true);
    
    useEffect(() => {
        (async () => {
            const componentProps = await component.getControlProps(props);
            if(!mountedRef.current) {
                return;
            }
            setController({
                column: props.column,
                componentProps: componentProps
            })
        })();
    }, [props]);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        }
    }, []);

    return controller;
}