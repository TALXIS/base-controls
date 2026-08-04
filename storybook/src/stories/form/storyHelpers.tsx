import React from 'react'

export const renderStory = (node: React.ReactNode, padding = 0) => (
    <div style={{ padding: padding || 18, height: '100%' }}>{node}</div>
)

export const renderFullScreenStory = (node: React.ReactNode) => (
    <div
        style={{
            height: '100vh',
            width: '100vw',
            margin: 0,
            padding: 0,
            overflow: 'hidden',
        }}
    >
        {node}
    </div>
)
