import { ILookupManyUiPillProps, LookupManyUiPill } from "../lookup-many-pill";

/** The replaceable pieces of {@link LookupManyPills}. */
export interface ILookupManyUiPillsComponents {
    /** One record, also the ones listed under the overflow. */
    onRenderPill: (props: ILookupManyUiPillProps) => JSX.Element;
}

/** The defaults for {@link ILookupManyUiPillsComponents}. */
export const LookupManyUiPillsComponents: ILookupManyUiPillsComponents = {
    onRenderPill: props => <LookupManyUiPill {...props} />,
};
