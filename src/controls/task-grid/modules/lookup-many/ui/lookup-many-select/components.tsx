import { components, OptionProps } from "react-select";
import AsyncSelect, { AsyncProps } from "react-select/async";
import { ILookupManyUiPillProps, LookupManyUiPill } from "../lookup-many-pill";

type Reference = ComponentFramework.EntityReference;

/** The replaceable pieces of {@link LookupManySelect}. */
export interface ILookupManyUiSelectComponents {
    onRender: (props: AsyncProps<Reference, true, never>) => JSX.Element;
    /** One picked record, handed `onRemove`. */
    onRenderPill: (props: ILookupManyUiPillProps) => JSX.Element;
    /** One record offered. */
    onRenderOption: (props: OptionProps<Reference, true, never>) => JSX.Element;
}

/** The defaults for {@link ILookupManyUiSelectComponents}. */
export const LookupManyUiSelectComponents: ILookupManyUiSelectComponents = {
    onRender: props => <AsyncSelect {...props} />,
    onRenderPill: props => <LookupManyUiPill {...props} />,
    onRenderOption: props => <components.Option {...props} />,
};
