import { DatasetControlUi, IFooterStartUiComponents } from "../../ui";
import { DatasetControlRegionContext } from "../region";

export interface IFooterStartProps {
    children?: React.ReactNode;
    className?: string;
    components?: Partial<IFooterStartUiComponents>;
}

/** The footer's left region, such as for the record count. */
export const FooterStart = (props: IFooterStartProps) => <DatasetControlRegionContext.Provider value="start">
    <DatasetControlUi.FooterStart {...props} />
</DatasetControlRegionContext.Provider>;
