import React from 'react'

export const renderStory = (node: React.ReactNode, padding = 0) => (
    <div style={{ minHeight: '100vh', padding }}>{node}</div>
)
