import type { IOptionTagComponents } from "../../option-tag";
import type { IRecordCardHeaderEndComponents } from "../header-end";
import type { IRecordCardHeaderStartComponents } from "../header-start";
import type { IRecordCardTitleComponents } from "../title";

/** The replaceable pieces of the header row. */
export interface IRecordCardHeaderComponents {
    /** The row. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IRecordCardHeaderComponents}. */
export const RecordCardHeaderComponents: IRecordCardHeaderComponents = {
    onRenderContainer: props => <div {...props} />,
};

/** The replaceable pieces of a header composed of the title and a status tag, by the part they belong to. */
export interface IRecordCardHeaderPartsComponents {
    header?: Partial<IRecordCardHeaderComponents>;
    headerStart?: Partial<IRecordCardHeaderStartComponents>;
    headerEnd?: Partial<IRecordCardHeaderEndComponents>;
    title?: Partial<IRecordCardTitleComponents>;
    status?: Partial<IOptionTagComponents>;
}
