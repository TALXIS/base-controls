import { components, OptionProps } from "react-select";
import AsyncSelect, { AsyncProps } from "react-select/async";
import { ILookupManyPillProps, LookupManyPill } from "../../lookup-many-pill";

type Reference = ComponentFramework.EntityReference;

/** The replaceable pieces of {@link LookupManySelect}. */
export interface ILookupManySelectComponents {
    onRenderSelect: (props: AsyncProps<Reference, true, never>) => JSX.Element;
    /** One picked record, handed `onRemove`. */
    onRenderPill: (props: ILookupManyPillProps) => JSX.Element;
    /** One record offered. */
    onRenderOption: (props: OptionProps<Reference, true, never>) => JSX.Element;
}

/** The defaults for {@link ILookupManySelectComponents}. */
export const LookupManySelectComponents: ILookupManySelectComponents = {
    onRenderSelect: props => <AsyncSelect {...props} />,
    onRenderPill: props => <LookupManyPill {...props} />,
    onRenderOption: props => <components.Option {...props} />,
};
