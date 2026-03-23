import { useMemo } from "react";
import { usePanelComponents, usePanelLabels, usePanelProps } from "../../context"
import { getFooterStyles } from "./styles";
import { getClassNames } from "../../../../utils";

export const Footer = (props: React.HTMLAttributes<HTMLDivElement>) => {
    const components = usePanelComponents();
    const labels = usePanelLabels();
    const styles = useMemo(() => getFooterStyles(), []);
    const { onDismiss, onPrimaryButtonClick } = usePanelProps();

    return (<div {...props} className={getClassNames([styles.footer, props.className])}>
        <components.FooterPrimaryButton
            text={labels.primaryButtonText}
            onClick={onPrimaryButtonClick}
        />
        <components.FooterDismissButton
            text={labels.dismiss}
            onClick={onDismiss}
        />
    </div>)
}