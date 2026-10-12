import * as Babel from '@babel/standalone'
import React from 'react'
import {
    TaskGrid, useTaskDataProvider, useTaskGridRuntime, useTaskGridLabels,
    createUserQueryModule, createTemplateModule, createLookupManyModule, createDependenciesModule, createChecklistModule,
    MemoryUserQueryStrategy, MemoryTemplateDataProvider, MemoryLookupManyDataProviderFactory, MemoryTaskDependencyStrategy, MemoryChecklistStrategy,
    ADD_TASK_COLUMN_NAME, PERCENT_COMPLETE_CONTROL_NAME, TASK_TREE_PRIORITY,
} from '@talxis/base-controls'
import type { ITaskGridDescriptor, ITaskGridFeatures, ITaskGridModules, ITaskGridProps } from '@talxis/base-controls'
import { Alert, Autocomplete, Avatar, AvatarGroup, Button, Chip, LinearProgress, Menu, MenuItem, Popover, Rating, Slider, Snackbar, Stack, TextField, Tooltip, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import SettingsIcon from '@mui/icons-material/Settings'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import { GRID_SANDBOX_SCOPE } from '../grid/gridSandboxScope'
import type { IMemoryModuleData } from './memoryDescriptor'

interface ITaskGridLivePreviewProps {
    code: string
    /**
     * Injected into the snippet rather than created by it: the descriptor owns the in-memory data, so
     * recreating it on every edit would reload the grid and throw the session away.
     */
    descriptor: ITaskGridDescriptor
    /** What the snippet's `TaskGrid` runs with when it passes no `modules` of its own. */
    modules: ITaskGridModules
    /** What the snippet's `TaskGrid` runs with when it passes no `features` of its own. */
    features: ITaskGridFeatures
    /** The fixture data a snippet builds its own modules from. */
    data: IMemoryModuleData
    onError?: (error: string | null) => void
}

const TASK_GRID_SCOPE = {
    useTaskDataProvider,
    useTaskGridRuntime,
    useTaskGridLabels,
    createUserQueryModule,
    createTemplateModule,
    createLookupManyModule,
    createDependenciesModule,
    createChecklistModule,
    MemoryUserQueryStrategy,
    MemoryTemplateDataProvider,
    MemoryLookupManyDataProviderFactory,
    MemoryTaskDependencyStrategy,
    MemoryChecklistStrategy,
    ADD_TASK_COLUMN_NAME,
    PERCENT_COMPLETE_CONTROL_NAME,
    TASK_TREE_PRIORITY,
    Alert,
    Autocomplete,
    Avatar,
    AvatarGroup,
    Button,
    Chip,
    LinearProgress,
    Menu,
    MenuItem,
    Popover,
    Rating,
    Slider,
    Snackbar,
    Stack,
    TextField,
    Tooltip,
    Typography,
    AddIcon,
    DoneAllIcon,
    DeleteIcon,
    EditIcon,
    PlaylistAddIcon,
    SettingsIcon,
    ViewColumnIcon,
}

/** Compiles the edited snippet and renders whatever `TaskGridExample` it defines. */
export const TaskGridLivePreview = (props: ITaskGridLivePreviewProps) => {
    const compiled = React.useMemo(() => {
        //what a snippet calls `TaskGrid`: the sandbox's modules and features, unless the snippet passes its own
        const SandboxTaskGrid = (taskGridProps: ITaskGridProps) => <TaskGrid enableNavigation height='600px' modules={props.modules} features={props.features} {...taskGridProps} />
        //MUI over Fluent where the two share a name: these examples draw with MUI
        const scope = { ...GRID_SANDBOX_SCOPE, ...TASK_GRID_SCOPE, TaskGrid: SandboxTaskGrid, descriptor: props.descriptor, defaultModules: props.modules, defaultFeatures: props.features, data: props.data }
        try {
            const transformed = Babel.transform(props.code, {
                presets: [
                    ['typescript', { allExtensions: true, isTSX: true }],
                    ['react', { runtime: 'classic' }],
                ],
                filename: 'task-grid-snippet.tsx',
            }).code ?? ''
            const factory = new Function(...Object.keys(scope), `${transformed}
                return typeof TaskGridExample !== "undefined" ? TaskGridExample : null;`)
            return { Component: factory(...Object.values(scope)) as React.ComponentType | null, error: null as string | null }
        } catch (error) {
            return { Component: null, error: (error as Error).message }
        }
        //the descriptor, the modules and the features are stable for the life of the story, so the code is the only trigger
    }, [props.code])

    React.useEffect(() => {
        props.onError?.(compiled.error)
    }, [compiled.error])

    if (compiled.error) {
        return <pre>{compiled.error}</pre>
    }

    if (!compiled.Component) {
        return <div>The code window must define a <code>TaskGridExample</code>.</div>
    }

    const PreviewComponent = compiled.Component

    return <TaskGridPreviewBoundary key={props.code}>
        <PreviewComponent />
    </TaskGridPreviewBoundary>
}

interface ITaskGridPreviewBoundaryProps {
    children: React.ReactNode
}

interface ITaskGridPreviewBoundaryState {
    error: string | null
}

class TaskGridPreviewBoundary extends React.Component<ITaskGridPreviewBoundaryProps, ITaskGridPreviewBoundaryState> {
    public readonly state: ITaskGridPreviewBoundaryState = {
        error: null,
    }

    public static getDerivedStateFromError(error: Error): ITaskGridPreviewBoundaryState {
        return {
            error: error.message,
        }
    }

    public render(): React.ReactNode {
        if (this.state.error) {
            return <pre>{this.state.error}</pre>
        }

        return this.props.children
    }
}
