import * as React from "react";
import { Pivot, useTheme, PivotItem } from "@fluentui/react";
import { TabsContext } from "./context";
import { getTabsStyles } from "./styles";
import { FormContext } from "../../form/FormContext";
import { useFormInstance } from "../../form/useFormInstance";
import { useFormUiState } from "../../form/useFormUiState";
import { useForm } from "../../form/context";
import { IFormEvents } from "../../form/FormModel";
import { useEventEmitter } from "../../../../hooks";
import { useRerender } from "@talxis/react-components";
import { Tab } from "../tab/Tab";

export interface IFormTabsProps {
    children?: React.ReactNode;
}

interface ITabEntryMetadata {
    id?: string;
    name?: string;
    label?: React.ReactNode;
    visible?: boolean;
}

type TabChildProps = ITabEntryMetadata & {
    tab?: ITabEntryMetadata;
};


export const Tabs = (props: IFormTabsProps) => {
    const form = useForm();
    const childrenArray = React.Children.toArray(props.children).filter(child => React.isValidElement(child));
    const childrenArrayRef = React.useRef(childrenArray);
    childrenArrayRef.current = childrenArray;
    const rerender = useRerender();
    useEventEmitter<IFormEvents>(form.events, 'onTabExpanded', rerender)

    if (childrenArray.length === 0) {
        throw new Error("[Form] Tabs must have at least one Tab child.");
    }

    const getExpandedTabId = (): string => {
        let tab = form.getExpandedTab();
        //can happen in codeful mode when whe are yet to build the model
        if (!tab) {
            const expandedChild = childrenArray.find(child => child.props.tab.expanded === true) ?? childrenArray[0];
            return expandedChild.props.tab.id;
        }
        return tab.id;
    }

    const onRenderPivotItem = (child: React.ReactElement) => {
        const id = child.props.tab.id;
        const tab = form.getTab(id);
        const name = tab?.name ?? child.props.tab.name ?? tab?.id ?? child.props.tab.id;

        if (!tab) {
            //closure
            form.addTab(() => {
                return childrenArrayRef.current.find(c => c.props.tab.id === id)?.props.tab
            });
        }
        
        return <PivotItem key={id} headerText={name} itemKey={id}>
            {child}
        </PivotItem>
    }

    return <Pivot selectedKey={getExpandedTabId()} onLinkClick={(item) => form.setExpandedTab(item?.props.itemKey!)}>
        {childrenArray.map(child => onRenderPivotItem(child))}
    </Pivot>
}

export const Tabs2 = ({ children }: IFormTabsProps) => {
    const formContext = React.useContext(FormContext);
    if (!formContext) {
        throw new Error("[Form] Tabs must be rendered inside Form.");
    }

    const theme = useTheme();
    const form = useFormInstance();
    useFormUiState();

    const tabEntries = React.Children.toArray(children)
        .filter((child): child is React.ReactElement<TabChildProps> => React.isValidElement<TabChildProps>(child))
        .map((child, index) => ({
            metadata: getTabEntryMetadata(child.props),
            key: getTabEntryKey(getTabEntryMetadata(child.props), index),
            child,
        }))
        .filter(({ metadata }) => {
            if (metadata.visible === false) {
                return false;
            }

            if (metadata.name) {
                return form.getTabVisible(metadata.name) !== false;
            }

            return true;
        });
    const [selectedKey, setSelectedKey] = React.useState<string | undefined>(tabEntries[0]?.key);

    const activeTabEntry = React.useMemo(() => {
        if (tabEntries.length === 0) {
            return null;
        }

        const activeName = form.getActiveTabName();
        if (activeName) {
            const matched = tabEntries.find(({ metadata }) => metadata.name === activeName);
            if (matched) {
                return matched;
            }
        }

        if (selectedKey) {
            const matched = tabEntries.find((entry) => entry.key === selectedKey);
            if (matched) {
                return matched;
            }
        }

        return tabEntries[0];
    }, [form, selectedKey, tabEntries]);

    React.useEffect(() => {
        const nextSelectedKey = activeTabEntry?.key;
        if (nextSelectedKey && nextSelectedKey !== selectedKey) {
            setSelectedKey(nextSelectedKey);
        }
    }, [activeTabEntry, selectedKey]);

    React.useEffect(() => {
        const nextActiveName = activeTabEntry?.metadata.name;
        if (nextActiveName && nextActiveName !== form.getActiveTabName()) {
            form.setActiveTab(nextActiveName);
        }
    }, [activeTabEntry, form]);

    const styles = getTabsStyles(theme);

    if (!activeTabEntry) {
        return null;
    }

    return (
        <TabsContext.Provider
            value={{
                activeTabId: activeTabEntry.metadata.id,
                activeTabName: activeTabEntry.metadata.name,
            }}
        >
            <div data-id="form-tabs" className={styles.root}>
                <Pivot
                    className={styles.pivot}
                    selectedKey={activeTabEntry.key}
                    onLinkClick={(item) => {
                        const key = item?.props.itemKey;
                        if (!key) return;
                        setSelectedKey(key);
                        const entry = tabEntries.find((e) => e.key === key);
                        if (entry?.metadata.name) {
                            form.setActiveTab(entry.metadata.name);
                        }
                    }}
                >
                    {tabEntries.map(({ key, metadata }, index) => {
                        const tabId = metadata.id ?? metadata.name ?? `tab-${index}`;
                        return (
                            <PivotItem
                                key={key}
                                itemKey={key}
                                headerText={String(metadata.label ?? metadata.name ?? tabId)}
                                id={`${tabId}-trigger`}
                                aria-controls={`${tabId}-panel`}
                            />
                        );
                    })}
                </Pivot>
                <div className={styles.panel}>
                    {tabEntries.map(({ key, child }) => (
                        <React.Fragment key={key}>{child}</React.Fragment>
                    ))}
                </div>
            </div>
        </TabsContext.Provider>
    );
};

const getTabEntryMetadata = (props: TabChildProps): ITabEntryMetadata => {
    if (props.tab) {
        return {
            id: props.tab.id,
            name: props.tab.name,
            label: props.tab.label,
            visible: props.tab.visible,
        };
    }

    return {
        id: props.id,
        name: props.name,
        label: props.label,
        visible: props.visible,
    };
};

const getTabEntryKey = (metadata: ITabEntryMetadata, index: number): string => {
    return String(metadata.name ?? metadata.id ?? `tab-${index}`);
};
