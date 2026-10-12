import { DatasetControlUi, IHeaderUiComponents } from "../../ui";
import { HeaderStart } from "./HeaderStart";
import { HeaderEnd } from "./HeaderEnd";

export interface IHeaderProps {
    children?: React.ReactNode;
    className?: string;
    components?: Partial<IHeaderUiComponents>;
}

const HeaderRow = (props: IHeaderProps) => <DatasetControlUi.Header {...props} />;

/** The row above the records, with `Start` and `End` regions for its parts. */
export const Header = Object.assign(HeaderRow, { Start: HeaderStart, End: HeaderEnd });
