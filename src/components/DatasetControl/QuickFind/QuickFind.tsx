import { useEffect, useMemo, useState } from "react";
import { IRibbonQuickFindWrapperProps } from "../interfaces";
import { useModel } from "../useModel";
import { TextField } from "@talxis/react-components";
import { getQuickFindStyles } from "./styles";
import { IInternalDataProvider } from "@talxis/client-libraries";

export const QuickFind = (props: { onRenderQuickFind: IRibbonQuickFindWrapperProps['onRenderQuickFind'] }) => {
  const [query, setQuery] = useState<string>('');
  const model = useModel();
  const dataset = model.getDataset();
  const dataProvider = dataset.getDataProvider() as IInternalDataProvider;
  const labels = model.getLabels();
  const styles = useMemo(() => getQuickFindStyles(), []);

  const onSearch = (query?: string) => {
    dataProvider.executeWithUnsavedChangesBlocker(() => {
      setQuery(query ?? '');
      dataset.setSearchQuery?.(query ?? '');
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
    onRenderTextField: (props, defaultRender) => defaultRender(props),
    textFieldProps: {
      value: query,
      placeholder: `${labels.search()} ${dataset.getMetadata()?.DisplayCollectionName ?? labels.records()}...`,
      styles: {
        root: styles.textFieldRoot,
        fieldGroup: styles.fieldGroup
      },
      disabled: dataset.loading,
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


    }
  }, (props) => {
    return <TextField {...props.textFieldProps} />
  })
}