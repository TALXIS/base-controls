import React from 'react'

export const renderStory = (node: React.ReactNode, padding = 0) => (
    <div style={{ padding, height: '100%' }}>{node}</div>
)
