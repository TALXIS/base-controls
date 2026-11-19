import { Pivot, PivotItem } from "@fluentui/react";

/** One header in the strip. */
export interface IFormV2UiTabsItem {
    name: string;
    label: string;
    /** The tab whose content is shown. */
    active?: boolean;
}

/** What the strip of headers is drawn from. */
export interface IFormV2UiTabsRenderProps {
    tabs: IFormV2UiTabsItem[];
    /** Fires when the user picks another tab. */
    onChange: (name: string) => void;
    className?: string;
}

/** The replaceable pieces of the tabs. */
export interface IFormV2UiTabsComponents {
    /** The strip of headers. */
    onRender: (props: IFormV2UiTabsRenderProps) => JSX.Element | null;
}

/** The defaults for {@link IFormV2UiTabsComponents}. */
export const FormV2UiTabsComponents: IFormV2UiTabsComponents = {
    onRender: props => <Pivot
        headersOnly
        overflowBehavior='menu'
        selectedKey={props.tabs.find(tab => tab.active)?.name ?? null}
        styles={{ root: props.className }}
        onLinkClick={item => item?.props.itemKey && props.onChange(item.props.itemKey)}>
        {props.tabs.map(tab => <PivotItem key={tab.name} itemKey={tab.name} headerText={tab.label} headerButtonProps={{ 'data-id': `tab-header-${tab.name}` }} />)}
    </Pivot>,
};
