import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { GRID_EXAMPLE_FILE } from './user-queries/gridExample'
import { VIEWS_FILE } from './user-queries/views'
import { USER_QUERIES_FILE } from './user-queries/userQueries'
import { DEALS_BODY_FILE } from './user-queries/dealsBody'
import { DEAL_PARTS_FILE } from './user-queries/dealParts'
import { DEAL_GALLERY_FILE } from './user-queries/dealGallery'
import { DEAL_BOARD_FILE } from './user-queries/dealBoard'
import { DEAL_TIMELINE_FILE } from './user-queries/dealTimeline'
import { OWNER_LEADERBOARD_FILE } from './user-queries/ownerLeaderboard'

const FILES = [GRID_EXAMPLE_FILE, VIEWS_FILE, USER_QUERIES_FILE, DEALS_BODY_FILE, DEAL_PARTS_FILE, DEAL_GALLERY_FILE, DEAL_BOARD_FILE, DEAL_TIMELINE_FILE, OWNER_LEADERBOARD_FILE]

/** The scratch harness for the user queries module, as the code a consumer writes: save, switch, manage and delete views. */
export const UserQueriesDatasetControl = () => <GridExampleRunner seedCode={FILES} />
