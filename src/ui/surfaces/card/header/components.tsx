import type { ICardHeaderStartComponents } from "../header-start";
import type { ICardHeaderEndComponents } from "../header-end";
import type { ICardTitleComponents } from "../title";

/** The replaceable pieces of the card header. */
export interface ICardHeaderComponents {
    /** The row. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ICardHeaderComponents}. */
export const CardHeaderComponents: ICardHeaderComponents = {
    onRender: props => <div {...props} />,
};

/** The replaceable pieces of a header composed of a title and what is beside it, by the part they belong to. */
export interface ICardHeaderPartsComponents {
    header?: Partial<ICardHeaderComponents>;
    headerStart?: Partial<ICardHeaderStartComponents>;
    headerEnd?: Partial<ICardHeaderEndComponents>;
    title?: Partial<ICardTitleComponents>;
}
