import { useMemo, useRef } from "react";
import { useControl } from "../../hooks";
import { MessageBar, MessageBarButton, MessageBarType, ThemeProvider } from "@fluentui/react";
import { datasetControlTranslations } from "./translations";
import { getDatasetControlStyles } from "./styles";
import { IDatasetControl } from "./interfaces";
import { QuickFind } from "./QuickFind/QuickFind";
import { ErrorBoundary } from "./ErrorBoundary";
import { useRerender } from "@talxis/react-components";
import { Client } from "@talxis/client-libraries";

const client = new Client();

export const DatasetControl = (props: IDatasetControl) => {
  const { labels, theme } = useControl('DatasetControl', props, datasetControlTranslations);
  const rerender = useRerender();
  const dataset = props.parameters.Grid;
  const injectedContextRef = useRef(props.context);
  const styles = useMemo(() => getDatasetControlStyles(theme, props.parameters.Height?.raw), []);
  const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);
  useMemo(() => {
    if (dataset.isVirtual() || !client.isTalxisPortal()) {
      dataset.setInterceptor('__onRequestRender', () => rerender());
    }
  }, []);

  //we need to have a way to customize the init behavior from above
  const componentProps = onOverrideComponentProps({
    onDatasetInit: () => {
      if (dataset.isVirtual()) {
        dataset.paging.loadExactPage(dataset.paging.pageNumber);
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

  const isQuickFindEnabled = () => {
    if (dataset.isVirtual() && props.parameters.EnableQuickFind?.raw) {
      return true;
    }
    return false;
  }


  return (
    <ThemeProvider {...componentProps.containerProps}>
      {isQuickFindEnabled() &&
        <div {...componentProps.headerProps.headerContainerProps}>
          {componentProps.headerProps.onRender(() => {
            return <>
              {isQuickFindEnabled() &&
                <QuickFind
                  dataset={dataset}
                  labels={labels}
                  theme={theme}
                  onGetQuickFindComponentProps={(props) => componentProps.headerProps.onGetQuickFindProps(props)} />
              }
            </>
          })}
        </div>
      }
      {props.onGetControlComponent({ ...props, context: injectedContextRef.current })}
    </ThemeProvider>
  )
}