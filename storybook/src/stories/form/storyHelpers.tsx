import React from 'react'

export const renderStory = (node: React.ReactNode, padding = 0) => (
    <div style={{ padding: padding || 18, height: '100%' }}>{node}</div>
)
