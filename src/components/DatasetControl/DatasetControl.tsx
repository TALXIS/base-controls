import { useMemo, useRef } from "react";
import { Grid } from "../Grid";
import { useControl } from "../../hooks";
import { MessageBar, MessageBarButton, MessageBarType, ThemeProvider } from "@fluentui/react";
import { datasetControlTranslations } from "./translations";
import { getDatasetControlStyles } from "./styles";
import { IDatasetControl } from "./interfaces";
import { QuickFind } from "./QuickFind/QuickFind";
import { ErrorBoundary } from "./ErrorBoundary";
import { useRerender } from "@talxis/react-components";

export const DatasetControl = (props: IDatasetControl) => {
  const { labels, theme } = useControl('DatasetControl', props, datasetControlTranslations);
  const rerender = useRerender();
  const dataset = props.parameters.Grid;
  const injectedContextRef = useRef(props.context);
  const styles = useMemo(() => getDatasetControlStyles(theme, props.parameters.Height?.raw), []);
  const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);
  //@ts-ignore - private property
  dataset._setRenderer(() => rerender());

  //we need to have a way to customize the init behavior from above
  const componentProps = onOverrideComponentProps({
    onDatasetInit: () => {
      if (dataset.paging.pageNumber > 1) {
        dataset.paging.loadExactPage(dataset.paging.pageNumber)
      }
      else {
        dataset.refresh();
      }
    },
    containerProps: {
      theme: theme,
      className: styles.datasetControlRoot,
    },
    headerProps: {
      headerContainerProps: {
        className: styles.headerRoot
      },
      onRender: (renderQuickFind) => renderQuickFind(),
      onGetQuickFindProps: (props) => props
    },
    onOverrideControlProps: (props) => props
  });

  const renderErrorMessageBar = (onReset?: () => void) => {
    <MessageBar
      isMultiline={false}
      actions={<MessageBarButton className={styles.messageBarBtn} text={labels.reload()} onClick={() => {
        onReset?.();
        dataset.refresh();
      }} />}
      messageBarType={MessageBarType.error}>
      {dataset.errorMessage || labels.generalError()}
    </MessageBar>
  }

  useMemo(() => {
    //@ts-ignore - private property
    injectedContextRef.current = dataset._patchContext(props.context);
  }, [props.context]);

  useMemo(() => {
    componentProps.onDatasetInit();
  }, []);


  return (
    <ThemeProvider {...componentProps.containerProps}>
      <div {...componentProps.headerProps.headerContainerProps}>
        {componentProps.headerProps.onRender(() => {
          return <>
            {props.parameters.EnableQuickFind?.raw &&
              <QuickFind 
                dataset={dataset} 
                labels={labels} 
                theme={theme}
                onGetQuickFindComponentProps={(props) => componentProps.headerProps.onGetQuickFindProps(props)} />
            }
          </>
        })}
      </div>
        <Grid
          {...props}
          onOverrideComponentProps={(props) => componentProps.onOverrideControlProps(props)}
          context={injectedContextRef.current} />
    </ThemeProvider>
  )
}