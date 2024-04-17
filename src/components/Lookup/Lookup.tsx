
import { useComponent } from "../../hooks";
import { ILookup } from "./interfaces";

export const Lookup = (props: ILookup) => {
    const parameters = props.parameters;
    const context = props.context;
    const value = parameters.value;
    const [ notifyOutputChanged ] = useComponent(props);
    return (
        <div></div>
    );
};