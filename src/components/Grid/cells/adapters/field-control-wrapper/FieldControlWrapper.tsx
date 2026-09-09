import { FieldControl, IFieldControlProps } from "../field-control";
import { FieldControlWrapperComponents, IFieldControlWrapperComponents } from "./components";

export interface IFieldControlWrapperProps extends IFieldControlProps {
    components?: Partial<IFieldControlWrapperComponents>;
}

/** What a cell's control is drawn in: the inset AG Grid gives a cell none of. */
export const FieldControlWrapper = (props: IFieldControlWrapperProps) => {
    const { components: componentOverrides, ...fieldControlProps } = props;
    const components = { ...FieldControlWrapperComponents, ...componentOverrides };
    return components.onRenderContainer({ children: <FieldControl {...fieldControlProps} /> });
};
