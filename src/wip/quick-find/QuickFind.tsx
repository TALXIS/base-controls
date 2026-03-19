import React, { useMemo } from "react";
import { useContext } from "../shared"
import { QuickFindContext } from "./context";
import { useEventEmitter } from "../../hooks";
import { IQuickFindEvents } from "../../utils/quick-find/QuickFindBase";
import { Text, FontIcon } from "@fluentui/react";
import { components as defaultComponents } from "./components";
import { getQuickFindStyles } from "./styles";
import { IQuickFindComponents } from "./components";
import { IQuickFindLabels, QUICK_FIND_LABELS } from "./labels";

interface IQuickFindProps {
    components?: Partial<IQuickFindComponents>;
    labels?: Partial<IQuickFindLabels>;
}

export const QuickFind = (props: IQuickFindProps) => {
    const styles = useMemo(() => getQuickFindStyles(), []);
    const context = useContext('QuickFind', QuickFindContext);
    const components = { ...defaultComponents, ...props.components };
    const labels = { ...QUICK_FIND_LABELS, ...props.labels };
    const columnNames = context.getColumnNames();
    const [isCalloutVisible, setIsCalloutVisible] = React.useState(false);
    const [query, setQuery] = React.useState(context.getSearchQuery());
    const isLikeQuery = query.startsWith('*');
    const searchBoxId = useMemo(() => `quickfind-${crypto.randomUUID()}`, []);

    useEventEmitter<IQuickFindEvents>(context, 'onSearchQueryChanged', (newQuery) => onSearchQueryChanged(newQuery));

    const onSearchQueryChanged = (newQuery: string) => {
        setQuery(newQuery);
        document.getElementById(searchBoxId)?.focus();
    }

    const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            context.setSearchQuery(query);
            setIsCalloutVisible(false);
        }
    }

    return (
        <div id={searchBoxId} className={styles.quickFindContainer}>
            <components.SearchBox
                value={query}
                onChange={(e, newValue) => setQuery(newValue ?? '')}
                onFocus={() => setIsCalloutVisible(true)}
                onBlur={() => setIsCalloutVisible(false)}
                onKeyUp={onKeyUp}
                autoComplete="off"
                placeholder={labels.placeholder}
            />
            {isCalloutVisible && (columnNames.length > 0 || isLikeQuery) && (
                <div style={{ position: 'absolute' }}>
                    <components.Callout
                        target={`#${searchBoxId}`}
                        calloutMaxWidth={250}
                        styles={{ calloutMain: styles.calloutMain }}
                    >
                        {isLikeQuery &&
                            <Text>
                                <FontIcon className={styles.calloutWarningIcon} iconName="Warning" />
                                {labels.likeWarning}
                            </Text>
                        }
                        {!isLikeQuery &&
                            <Text>
                                {`${labels.applies} `}
                                <span className={styles.calloutBoldText}>{labels.beginsWith} </span>
                                {`${labels.theseColumns}:`}
                            </Text>
                        }
                        <div className={styles.calloutColumnsWrapper}>
                            {columnNames.map((col, i) => (
                                <Text title={col} className={styles.calloutColumnName} key={i}>{col}</Text>
                            ))}
                        </div>
                    </components.Callout>
                </div>
            )}
        </div>
    )
}