import { useEffect, useMemo, useState } from "react";
import { IRibbonQuickFindWrapperProps } from "../interfaces";
import { useModel } from "../useModel";
import { TextField } from "@talxis/react-components";
import { getQuickFindStyles } from "./styles";
import { IInternalDataProvider } from "@talxis/client-libraries";
import { Callout, FontIcon } from "@fluentui/react";
import { Text } from "@fluentui/react";

export const QuickFind = (props: { onRenderQuickFind: IRibbonQuickFindWrapperProps['onRenderQuickFind'] }) => {
  const [query, setQuery] = useState<string>('');
  const model = useModel();
  const dataset = model.getDatasetControl().getDataset();
  const dataProvider = dataset.getDataProvider() as IInternalDataProvider;
  const labels = model.getLabels();
  const styles = useMemo(() => getQuickFindStyles(), []);
  const id = useMemo(() => `quickfind-${crypto.randomUUID()}`, []);
  const [isCalloutVisible, setIsCalloutVisible] = useState<boolean>(false);
  const quickFindColumns = dataProvider.getQuickFindColumns();
  const isLikeQuery = query.startsWith('*');

  const onSearch = (query?: string) => {
    dataProvider.executeWithUnsavedChangesBlocker(() => {
      setQuery(query ?? '');
      dataset.setSearchQuery?.(query ?? '');
      setIsCalloutVisible(false);
      dataset.refresh();
    })
  }

  const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(query);
    }
  }

  useEffect(() => {
    setQuery(dataset.getSearchQuery?.() ?? '');
  }, [dataset.getSearchQuery?.()])

  return props.onRenderQuickFind({
    containerProps: {
      id: id,
    },
    onRenderTextField: (props, defaultRender) => defaultRender(props),
    onRenderCalloutContainer: (props, defaultRender) => defaultRender(props),
  }, (props) => {
    return <div {...props.containerProps}>
      {props.onRenderTextField({
        value: query,
        placeholder: `${labels.search()} ${dataset.getMetadata()?.DisplayCollectionName ?? labels.records()}...`,
        styles: {
          root: styles.textFieldRoot,
          fieldGroup: styles.fieldGroup
        },
        disabled: dataset.loading || quickFindColumns.length === 0,
        onClick: () => setIsCalloutVisible(true),
        onBlur: () => setIsCalloutVisible(false),
        onChange: (e, newValue) => setQuery(newValue ?? ''),
        onKeyUp: onKeyUp,
        ...(query ? {
          deleteButtonProps: {
            key: 'delete',
            iconProps: {
              iconName: 'Cancel'
            },
            onClick: () => onSearch(undefined)
          }
        } : {}),
        suffixItems: [{
          key: 'search',
          iconProps: {
            iconName: 'Search'
          },
          onClick: () => onSearch(query)
        }]
      }, (props) => {
        return <TextField {...props} />
      })}
      {props.onRenderCalloutContainer({
        style: { position: 'absolute' },
        onRenderCallout: (props, defaultRender) => defaultRender(props),
        isVisible: isCalloutVisible
      }, (props) => {
        if (props.isVisible) {
          const { onRenderCallout, isVisible, ...divProps } = props;
          return <div {...divProps}>
            {onRenderCallout({
              target: `#${id}`,
              isVisible: isCalloutVisible && (quickFindColumns.length > 0 || isLikeQuery),
              calloutMaxWidth: 250,
              isLikeQuery: isLikeQuery,
              styles: {
                calloutMain: styles.calloutMain
              },
              hidden: false,
              onDismiss: () => setIsCalloutVisible(false),
              onRenderLikeOperatorWarning: (props, defaultRender) => defaultRender(props),
              onRenderBegingsWithFilterInfo: (props, defaultRender) => defaultRender(props),
              onRenderColumnsList: (props, defaultRender) => defaultRender(props)
            }, (props) => {
              const { onRenderLikeOperatorWarning, onRenderBegingsWithFilterInfo, onRenderColumnsList, isLikeQuery, ...calloutProps } = props;
              return <Callout {...calloutProps}>
                {props.isLikeQuery &&
                  props.onRenderLikeOperatorWarning({}, (props) => {
                    return <Text {...props}><FontIcon className={styles.calloutWarningIcon} iconName="Warning" />{labels["quickfind-like-warning"]()}</Text>
                  })
                }
                {!props.isLikeQuery && 
                  props.onRenderBegingsWithFilterInfo({}, (props) => {
                    return <Text {...props}>{labels["quickfind-search-use-filter"]()} <span className={styles.calloutBoldText}>{labels["quickfind-search-starts-with"]()}</span> {labels["quickfind-search-on-these-columns"]()}</Text>
                  })
                }
                {props.onRenderColumnsList({
                  className: styles.calloutColumnsWrapper,
                  columns: quickFindColumns,
                  onRenderColumnLabel: (props, defaultRender) => defaultRender(props)
                }, (props) => {
                    const { onRenderColumnLabel, columns, ...divProps } = props;
                    return <div {...divProps}>
                      {props.columns.map(col => {
                         return props.onRenderColumnLabel({
                            key: col.name
                         }, (props) => {
                            return <Text {...props}><span className={styles.calloutBoldText}>{col.displayName}</span></Text>
                         })
                      })}
                    </div>
                })}
              </Callout>
            })}
          </div>
        }
        else {
          return <></>
        }
      })}
    </div>
  })
}