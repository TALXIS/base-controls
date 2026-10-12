import { DatasetControlUi, IHeaderStartUiComponents } from "../../ui";
import { DatasetControlRegionContext } from "../region";

export interface IHeaderStartProps {
    children?: React.ReactNode;
    className?: string;
    components?: Partial<IHeaderStartUiComponents>;
}

/** The header's left region, such as for the view switcher. */
export const HeaderStart = (props: IHeaderStartProps) => <DatasetControlRegionContext.Provider value="start">
    <DatasetControlUi.HeaderStart {...props} />
</DatasetControlRegionContext.Provider>;
