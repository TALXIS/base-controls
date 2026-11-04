import React from 'react'

export const renderStory = (node: React.ReactNode, padding = 18) => (
    <div style={{ padding, height: '100%' }}>{node}</div>
)
