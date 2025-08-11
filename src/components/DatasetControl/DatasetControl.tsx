import { useEffect, useMemo, useRef } from "react";
import { useControl } from "../../hooks";
import { ThemeProvider } from "@fluentui/react";
import { datasetControlTranslations } from "./translations";
import { IDatasetControl } from "./interfaces";
import { useRerender } from "@talxis/react-components";
import { DatasetControlModel } from "./DatasetControlModel";
import { ModelContext } from "./useModel";
import { Pagination } from "./Pagination/Pagination";
import { getDatasetControlStyles } from "./styles";
import { Header } from "./Header/Header";

export const DatasetControl = (props: IDatasetControl) => {
  const { labels, theme } = useControl('DatasetControl', props, datasetControlTranslations);
  const propsRef = useRef<IDatasetControl>(props);
  propsRef.current = props;
  const model = useMemo(() => new DatasetControlModel({
    getProps: () => propsRef.current,
    getLabels: () => labels,
  }), []);
  const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);
  const rerender = useRerender();
  const styles = useMemo(() => getDatasetControlStyles(props.parameters.Height?.raw), [props.parameters.Height?.raw]);
  const dataset = model.getDataset();

  const componentProps = onOverrideComponentProps({
    onRender: (props, defaultRender) => defaultRender(props),
  })

  const isFooterVisible = () => {
    switch (true) {
      case model.isPaginationVisible():
      case model.isRecordCountVisible():
      case model.isPageSizeSwitcherVisible():
        return true;
      default:
        return false;
    }
  }

  const isPaginationVisible = () => {
    return isFooterVisible();
  }

  useEffect(() => {
    dataset.addEventListener('onNewDataLoaded', () => rerender());
    dataset.addEventListener('onRenderRequested', () => rerender());
    dataset.addEventListener('onLoading', () => rerender());
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
          return <div {...props.controlContainerProps}>
            {propsRef.current.onGetControlComponent(propsRef.current)}
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