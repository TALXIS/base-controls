import { useLabels } from "@labels";
import { LINKS_LABELS } from "../../labels";
import { IRecordCardHeaderPartsComponents, RecordCardHeader, RecordCardHeaderStart, RecordCardTitle } from "@ui";
import { useLinkTooltip } from "../link-tooltip-surface/context";

export interface ILinkTooltipHeaderProps {
    components?: IRecordCardHeaderPartsComponents;
}

/** The dependency's type. */
export const LinkTooltipHeader = (props: ILinkTooltipHeaderProps) => {
    const { dependency } = useLinkTooltip();
    const labels = useLabels(LINKS_LABELS);
    const components = props.components ?? {};
    return <RecordCardHeader components={components.header}>
        <RecordCardHeaderStart components={components.headerStart}>
            <RecordCardTitle components={components.title}>{labels.get(`links.${dependency.type}`)}</RecordCardTitle>
        </RecordCardHeaderStart>
    </RecordCardHeader>;
};
