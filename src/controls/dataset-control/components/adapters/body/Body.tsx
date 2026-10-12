import { DatasetControlUi, IBodyUiComponents } from "../../ui";

export interface IBodyProps {
    children?: React.ReactNode;
    className?: string;
    components?: Partial<IBodyUiComponents>;
}

/** What fills the height the header and footer leave, usually the grid. */
export const Body = (props: IBodyProps) => <DatasetControlUi.Body {...props} />;
