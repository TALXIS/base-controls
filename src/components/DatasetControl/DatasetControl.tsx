import { useEffect, useMemo, useRef } from "react";
import { useControl } from "../../hooks";
import { ThemeProvider } from "@fluentui/react";
import { datasetControlTranslations } from "./translations";
import { useRerender } from "@talxis/react-components";
import { DatasetControlModel } from "./DatasetControlModel";
import { ModelContext } from "./useModel";
import { Pagination } from "./Pagination/Pagination";
import { getDatasetControlStyles } from "./styles";
import { Header } from "./Header/Header";
import { useEventEmitter } from "../../hooks/useEventEmitter";
import { IDataProviderEventListeners } from "@talxis/client-libraries";
import { IDatasetControlProps } from "./interfaces";

export const DatasetControl = (props: IDatasetControlProps) => {
  const { labels, theme } = useControl('DatasetControl', {
    ...props,
    context: props.onGetDatasetControlInstance().getPcfContext(),
    parameters: props.onGetDatasetControlInstance().getParameters(),
  }, datasetControlTranslations);
  
  const propsRef = useRef<IDatasetControlProps>(props);
  propsRef.current = props;
  const datasetControl = propsRef.current.onGetDatasetControlInstance();
  const model = useMemo(() => new DatasetControlModel({
    datasetControl: datasetControl,
    getLabels: () => labels,
  }), []);
  useMemo(() => props.onGetDatasetControlInstance().init(), []);
  const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);
  const rerender = useRerender();
  const styles = useMemo(() => getDatasetControlStyles(datasetControl.getHeight()), [datasetControl.getHeight()]);
  const dataset = datasetControl.getDataset();

  useEventEmitter<IDataProviderEventListeners>(dataset, 'onNewDataLoaded', rerender);
  useEventEmitter<IDataProviderEventListeners>(dataset, 'onRenderRequested', rerender);
  useEventEmitter<IDataProviderEventListeners>(dataset, 'onBeforeNewDataLoaded', rerender);


  const componentProps = onOverrideComponentProps({
    onRender: (props, defaultRender) => defaultRender(props),
  })

  const isFooterVisible = () => {
    switch (true) {
      case datasetControl.isPaginationVisible():
      case datasetControl.isRecordCountVisible():
      case datasetControl.isPageSizeSwitcherVisible():
        return true;
      default:
        return false;
    }
  }

  const isPaginationVisible = () => {
    return isFooterVisible();
  }

  useEffect(() => {
    return () => {
      datasetControl.destroy();
    }
  }, []);

  return <ModelContext.Provider value={model}>
    {componentProps.onRender({
      container: {
        theme: theme,
        className: styles.datasetControlRoot
      },
      onRenderHeader: (props, defaultRender) => defaultRender(props),
      onRenderFooter: (props, defaultRender) => defaultRender(props),
      onRenderControlContainer: (props, defaultRender) => defaultRender(props)
    }, (props) => {
      return <ThemeProvider {...props.container}>
        <Header onRenderHeader={props.onRenderHeader} />
        {props.onRenderControlContainer({
          controlContainerProps: {
            className: styles.controlContainer
          },

        }, (props) => {
          const { onOverrideComponentProps, ...filteredProps } = propsRef.current;
          return <div {...props.controlContainerProps}>
            {propsRef.current.onGetControlComponent({
              ...filteredProps,
              parameters: datasetControl.getParameters(),
              context: datasetControl.getPcfContext(),
              state: datasetControl.getState()[datasetControl.getControlId()]
            })}
          </div>
        })}
        {props.onRenderFooter({
          footerContainerProps: {
            className: styles.footer
          },
          onRenderPagination: (props, defaultRender) => defaultRender(props)
        }, (props) => {
          if (!isFooterVisible()) {
            return <></>
          }
          return <div {...props.footerContainerProps}>
            {isPaginationVisible() &&
              <Pagination onRenderPagination={props.onRenderPagination} />
            }
          </div>
        })}
      </ThemeProvider>
    })}
  </ModelContext.Provider>
}