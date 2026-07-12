import * as React from "react";
import { Text, useTheme } from "@fluentui/react";
import { useSectionsContext } from "../sections";
import { SectionContext } from "./context";
import { getSectionStyles } from "./styles";
import { useTabContext } from "../tab";
import { useFormInstance } from "../../form/useFormInstance";
import { useFormUiState } from "../../form/useFormUiState";
import { useMemo } from "react";
import { useForm } from "../../form/context";
import type { ISection, ITab } from "../../form/FormModel";
import type { IFormTabProps } from "../tab/Tab";
import { useFormComponent } from "../../form/useFormComponent";

export interface IFormSectionProps {
    id?: string;
    name?: string;
    group?: string;
    showLabel?: boolean;
    labelId?: string;
    showBar?: boolean;
    isUserDefined?: string;
    height?: string;
    lockLevel?: number;
    layout?: string;
    addedBy?: string;
    visible?: boolean;
    autoExpand?: boolean;
    columns?: number;
    labelWidth?: number;
    cellLabelTopBreakpoint?: number;
    availableForPhone?: boolean;
    cellLabelAlignment?: "Center" | "Left" | "Right";
    cellLabelPosition?: "Top" | "Left";
    rowHeight?: number;
    label?: React.ReactNode;
    children?: React.ReactNode;
}

export const Section = (props: IFormSectionProps) => {
    useSectionsContext()
    const { children, showBar = true, showLabel = true, label, name, id } = props;
    const section = useFormComponent('Section', props)
    const theme = useTheme();
    const styles = useMemo(() => getSectionStyles(theme), [theme]);
    const isHeaderVisible = showBar && showLabel && label;

    return <div className={styles.section} data-id={`section-${section.id}`}>
        {isHeaderVisible && (
            <div className={styles.header}>
                <Text variant="mediumPlus" className={styles.title}>
                    {label}
                </Text>
            </div>
        )}
        <div className={styles.body}>
            <SectionContext.Provider value={section}>
                {children}
            </SectionContext.Provider>
        </div>
    </div>
}

export const Section2 = (props: IFormSectionProps) => {
    useSectionsContext();

    const theme = useTheme();
    const form = useFormInstance();
    const tab = useTabContext();
    useFormUiState();
    const {
        id,
        name,
        showLabel = true,
        showBar,
        visible = true,
        label,
        children,
    } = props;

    if (visible === false) {
        return null;
    }

    const resolvedTabName = tab.name ?? "";
    if (resolvedTabName && name && form.getSectionVisible(resolvedTabName, name) === false) {
        return null;
    }

    const styles = getSectionStyles(theme, showBar);

    return (
        <SectionContext.Provider value={props}>
            <div className={styles.root} data-id={`section-${name ?? id ?? ""}`}>
                {showBar !== false && showLabel && label && (
                    <div className={styles.header}>
                        <Text variant="mediumPlus" className={styles.title} data-id={`section-label-${name ?? id ?? ""}`}>
                            {label}
                        </Text>
                    </div>
                )}
                <div className={styles.body}>
                    {children}
                </div>
            </div>
        </SectionContext.Provider>
    );
};
