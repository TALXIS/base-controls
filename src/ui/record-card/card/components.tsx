import type { IOptionTagComponents } from "../../option-tag";
import type { ICardHeaderComponents } from "../../surfaces/card/header";
import type { ICardHeaderStartComponents } from "../../surfaces/card/header-start";
import type { ICardHeaderEndComponents } from "../../surfaces/card/header-end";
import type { ICardTitleComponents } from "../../surfaces/card/title";

/** The replaceable pieces of the record card. */
export interface IRecordCardComponents {
    /** The card's box. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IRecordCardComponents}. */
export const RecordCardComponents: IRecordCardComponents = {
    onRender: props => <div {...props} />,
};

/** The replaceable pieces of a header composed of the title and a status tag, by the part they belong to. */
export interface IRecordCardHeaderPartsComponents {
    header?: Partial<ICardHeaderComponents>;
    headerStart?: Partial<ICardHeaderStartComponents>;
    headerEnd?: Partial<ICardHeaderEndComponents>;
    title?: Partial<ICardTitleComponents>;
    status?: Partial<IOptionTagComponents>;
}
