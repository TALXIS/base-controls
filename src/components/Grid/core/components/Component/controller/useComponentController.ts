import { useEffect, useMemo,useState } from "react"
import { IComponentProps } from "../Component";
import { Component } from '../model/Component';
import { useGridInstance } from "../../../hooks/useGridInstance";
import { IComponent } from "../../../../../../interfaces/context";

export const useComponentController = (props: IComponentProps): IComponent<any, any, any> | undefined => {
    const grid = useGridInstance();
    const component = useMemo(() => new Component(grid), []);
    const [controlProps, setControlProps] = useState<IComponent<any, any, any>>();
    useEffect(() => {
        (async () => {
            setControlProps(await component.getControlProps(props));
        })();
    }, [props]);

    return controlProps;
}