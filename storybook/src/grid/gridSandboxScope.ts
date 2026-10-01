import React from 'react'
import { DefaultButton, FontWeights, Icon, IconButton, mergeStyleSets, MessageBar, MessageBarType, PrimaryButton, Stack, Toggle, TooltipHost } from '@fluentui/react'
import {
    createAggregationModule, createCellSelectionModule, createClientSideRowModelModule, createClipboardModule, createFilteringModule,
    createGroupingModule, createLegacyClientApiCompatibilityModule, createRowSelectionModule, createServerSideRowModelModule, createSortingModule, Grid, GRID_MODULE_PRIORITY, RECORD_LOCK_COLUMN_KEY, useGridService,
} from '@talxis/base-controls'
import { DataTypes, MemoryDataProvider, Operators } from '@talxis/client-libraries'
import { createDocsProvider } from './gridDocsData'

/** Everything a snippet may use without importing it, apart from the injected `provider`. */
export const GRID_SANDBOX_SCOPE = {
    React,
    Grid,
    useGridService,
    GRID_MODULE_PRIORITY,
    RECORD_LOCK_COLUMN_KEY,
    createClientSideRowModelModule,
    createServerSideRowModelModule,
    createRowSelectionModule,
    createCellSelectionModule,
    createClipboardModule,
    createSortingModule,
    createFilteringModule,
    createGroupingModule,
    createAggregationModule,
    createLegacyClientApiCompatibilityModule,
    createDocsProvider,
    MemoryDataProvider,
    DataTypes,
    Operators,
    Icon,
    IconButton,
    PrimaryButton,
    DefaultButton,
    MessageBar,
    MessageBarType,
    Stack,
    Toggle,
    TooltipHost,
    mergeStyleSets,
    FontWeights,
}
