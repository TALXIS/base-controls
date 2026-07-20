import React from "react";
import { useRerender } from "@talxis/react-components";
import { Section } from "../../../../../components";
import { ISection } from "../../../Form";
import { XrmCell } from "../xrm-cell/XrmCell";
import { useEventEmitter } from "../../../../../../../hooks";

export interface IXrmSectionProps {
    section: ISection;
}

export const XrmSection = (props: IXrmSectionProps) => {
    const { section } = props;
    const rerender = useRerender();
    useEventEmitter(section.events, ['onCellSetVisible'], rerender);

    return <Section
        cellLabelPosition={section.getCellLabelPosition()}
        showLabel={section.showlabel}
        labelWidth={section.labelwidth}
        label={section.getLocalizedLabel() ?? undefined}
    >
        {section.getVisibleCells().map((cell, index) => <XrmCell key={cell.id ?? index} cell={cell} />)}
    </Section>;
};