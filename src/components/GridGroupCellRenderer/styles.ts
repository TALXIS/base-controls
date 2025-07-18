import { mergeStyleSets } from "@fluentui/react"
import { IColumn } from "@talxis/client-libraries";
import { GridCellRendererModel } from "./GridCellRendererModel";

let minHeight: number | undefined = undefined;

export const getGridCellRendererStyles = (model: GridCellRendererModel, height?: number) => {
    const columnAlignment = model.getColumnAlignment();
    const theme = model.getControlTheme();
    const isMultiline = model.isMultiline();
    const hasAggregationLabel = !!model.getAggregationLabel();
    const formattedAggregatedValue = model.getFormattedAggregatedValue();
    const value = model.getValue();

    if(minHeight === undefined) {
        minHeight = height;
    }
    return mergeStyleSets({
        gridCellRendererRoot: {
            height: '100%',
            minHeight: isMultiline ? minHeight : undefined,
            paddingLeft: 8,
            paddingRight: 8,
            display: 'flex',
            alignItems: getAlignItems(columnAlignment, hasAggregationLabel, isMultiline),
            justifyContent: hasAggregationLabel ? 'flex-end' : getJustifyContent(columnAlignment),
            flexDirection: hasAggregationLabel ? 'column' : 'row',
            overflow: 'hidden',
            resize: isMultiline ? 'vertical' : undefined
        },
        contentContainer: {
            display: 'flex',
            minWidth: 0,
            gap: 5,
            flexGrow: 1,
            width: '100%',
            alignItems: isMultiline ? 'flex-start' : 'flex-end'
        },
        innerContentContainer: {
            display: 'flex',
            overflow: 'hidden',
            justifyContent: getJustifyContent(columnAlignment),
            flexGrow: 1,
            gap: 3
        },
        aggregationLabel: {
            lineHeight: '1',
            fontSize: theme.fonts.small.fontSize,
            width: '100%',
            textAlign: columnAlignment,
            color: theme.semanticColors.infoIcon,
        },
        aggregatedValue: {
            ...formattedAggregatedValue != null && value == null ? {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            } : {}
        },
        valueContainer: {
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexGrow: 1,
            textAlign: columnAlignment,
        }
    })
}

const getAlignItems = (columnAlignment: IColumn['alignment'], hasAggregationLabel: boolean, isMultiline: boolean) => {
    if (hasAggregationLabel) {
        switch (columnAlignment) {
            case 'left': {
                return 'flex-start';
            }
            case 'center': {
                return 'center';
            }
            case 'right': {
                return 'flex-end';
            }
        }
    }
    if(isMultiline) {
        return 'flex-start'
    }
    else {
        return 'center';
    }
}

export const getJustifyContent = (columnAlignment: IColumn['alignment']) => {
    switch (columnAlignment) {
        case 'left': {
            return 'flex-start';
        }
        case 'center': {
            return 'center';
        }
        case 'right': {
            return 'flex-end';
        }
    }
}