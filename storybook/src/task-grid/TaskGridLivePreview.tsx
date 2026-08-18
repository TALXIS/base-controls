import * as Babel from '@babel/standalone'
import React from 'react'
import { TaskGrid, useTaskDataProvider } from '@talxis/base-controls/components/TaskGrid'
import type { ITaskGridDescriptor } from '@talxis/base-controls/components/TaskGrid'
import { Alert, Autocomplete, Avatar, AvatarGroup, Button, Chip, LinearProgress, Menu, MenuItem, Popover, Rating, Slider, Snackbar, Stack, TextField, Tooltip, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import SettingsIcon from '@mui/icons-material/Settings'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'

interface ITaskGridLivePreviewProps {
    code: string
    /**
     * Injected into the snippet rather than created by it: the descriptor owns the in-memory data, so
     * recreating it on every edit would reload the grid and throw the session away.
     */
    descriptor: ITaskGridDescriptor
    pcfContext: ComponentFramework.Context<any>
    onError?: (error: string | null) => void
}

/** Compiles the edited snippet and renders whatever `TaskGridExample` it defines. */
export const TaskGridLivePreview = (props: ITaskGridLivePreviewProps) => {
    const compiled = React.useMemo(() => {
        try {
            const transformed = Babel.transform(props.code, {
                presets: [
                    ['typescript', { allExtensions: true, isTSX: true }],
                    ['react', { runtime: 'classic' }],
                ],
                filename: 'task-grid-snippet.tsx',
            }).code ?? ''

            const factory = new Function(
                'React',
                'TaskGrid',
                'descriptor',
                'pcfContext',
                'useTaskDataProvider',
                'Chip',
                'Stack',
                'Alert',
                'Autocomplete',
                'Avatar',
                'AvatarGroup',
                'Button',
                'Snackbar',
                'AddIcon',
                'DoneAllIcon',
                'DeleteIcon',
                'EditIcon',
                'PlaylistAddIcon',
                'SettingsIcon',
                'ViewColumnIcon',
                'Menu',
                'MenuItem',
                'Popover',
                'LinearProgress',
                'Rating',
                'Slider',
                'TextField',
                'Tooltip',
                'Typography',
                `${transformed}
                 return typeof TaskGridExample !== "undefined" ? TaskGridExample : null;`,
            )

            const Component = factory(
                React,
                TaskGrid,
                props.descriptor,
                props.pcfContext,
                useTaskDataProvider,
                Chip,
                Stack,
                Alert,
                Autocomplete,
                Avatar,
                AvatarGroup,
                Button,
                Snackbar,
                AddIcon,
                DoneAllIcon,
                DeleteIcon,
                EditIcon,
                PlaylistAddIcon,
                SettingsIcon,
                ViewColumnIcon,
                Menu,
                MenuItem,
                Popover,
                LinearProgress,
                Rating,
                Slider,
                TextField,
                Tooltip,
                Typography,
            ) as React.ComponentType | null

            return { Component, error: null as string | null }
        } catch (error) {
            return { Component: null, error: (error as Error).message }
        }
        //the descriptor and context are stable for the life of the story, so the code is the only trigger
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
