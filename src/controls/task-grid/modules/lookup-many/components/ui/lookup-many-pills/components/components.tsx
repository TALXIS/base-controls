import { ILookupManyPillProps, LookupManyPill } from "../../lookup-many-pill";

/** The replaceable pieces of {@link LookupManyPills}. */
export interface ILookupManyPillsComponents {
    /** One record, also the ones listed under the overflow. */
    onRenderPill: (props: ILookupManyPillProps) => JSX.Element;
}

/** The defaults for {@link ILookupManyPillsComponents}. */
export const LookupManyPillsComponents: ILookupManyPillsComponents = {
    onRenderPill: props => <LookupManyPill {...props} />,
};
