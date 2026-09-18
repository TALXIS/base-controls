import { Action, AdaptiveCard, HostConfig, OpenUrlAction, SubmitAction } from 'adaptivecards';
import { useEffect, useMemo, useRef } from 'react';
import { ITheme } from '@legacy';
import { IMapCardAction, IMapCardProps, renameFormattedValueKeys } from '../../cards';
import { expandAdaptiveCardTemplate } from './template';
import { getAdaptiveMapCardStyles } from './styles';

/** Colours the Adaptive Card host from the control theme, so a card does not arrive in Adaptive Cards' own palette on top of a themed map. */
const getHostConfig = (theme: ITheme) => new HostConfig({
    fontFamily: theme.fonts.medium.fontFamily,
    containerStyles: {
        default: {
            backgroundColor: theme.semanticColors.bodyBackground,
            foregroundColors: {
                default: { default: theme.semanticColors.bodyText, subtle: theme.semanticColors.bodySubtext },
                accent: { default: theme.palette.themePrimary, subtle: theme.palette.themeSecondary },
                attention: { default: theme.semanticColors.errorText, subtle: theme.semanticColors.errorText },
                good: { default: theme.semanticColors.successIcon, subtle: theme.semanticColors.successIcon },
                warning: { default: theme.semanticColors.warningIcon, subtle: theme.semanticColors.warningIcon }
            }
        }
    }
});

/**
 * Reads the action a card's button stands for.
 *
 * A `Action.Submit` carrying `webResourceName` and `functionName` in its data runs that function, which is
 * how an Adaptive Card triggers custom code the same way the built-in card's buttons do.
 */
const getCardAction = (action: Action, definition: IMapCardProps['definition']): IMapCardAction | undefined => {
    if (!(action instanceof SubmitAction)) {
        return undefined;
    }
    const data = (action.data ?? {}) as { webResourceName?: string; functionName?: string };
    const webResourceName = data.webResourceName ?? definition.webResourceName;
    const functionName = data.functionName ?? definition.functionName;
    if (!webResourceName || !functionName) {
        return undefined;
    }
    return { label: action.title ?? functionName, webResourceName, functionName };
};

/**
 * Renders a record through an Adaptive Card template.
 *
 * The record's data is copied with its formatted value annotations renamed to `<attribute>_label` first,
 * because an Adaptive Cards binding expression cannot address a key containing `@` or `.` - the same
 * treatment the legacy MapPicker applied, so an existing template binds unchanged.
 */
export const AdaptiveMapCard = (props: IMapCardProps) => {
    const styles = useMemo(() => getAdaptiveMapCardStyles(props.theme), [props.theme]);
    const containerRef = useRef<HTMLDivElement>(null);
    const template = props.definition.template;
    const rawData = props.record.getRawData();
    const onExecuteAction = props.onExecuteAction;
    const definition = props.definition;
    const theme = props.theme;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }
        container.innerHTML = '';
        if (!template) {
            return;
        }
        try {
            const expanded = expandAdaptiveCardTemplate(JSON.parse(template), renameFormattedValueKeys(rawData));
            const card = new AdaptiveCard();
            card.hostConfig = getHostConfig(theme);
            card.onExecuteAction = (action) => {
                if (action instanceof OpenUrlAction && action.url) {
                    window.open(action.url, '_blank', 'noopener,noreferrer');
                    return;
                }
                const cardAction = getCardAction(action, definition);
                if (cardAction) {
                    onExecuteAction(cardAction);
                }
            };
            card.parse(expanded);
            const rendered = card.render();
            if (rendered) {
                container.appendChild(rendered);
            }
        } catch (error) {
            console.error('Map: the Adaptive Card template could not be rendered:', error);
            container.textContent = props.labels.cardTemplateFailed();
        }
    }, [template, rawData, theme, definition, onExecuteAction, props.labels]);

    return <div ref={containerRef} className={styles.root} />;
};
