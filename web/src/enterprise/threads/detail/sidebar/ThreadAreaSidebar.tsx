import SettingsIcon from 'mdi-react/SettingsIcon'
import SourcePullIcon from 'mdi-react/SourcePullIcon'
import ViewListIcon from 'mdi-react/ViewListIcon'
import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ChatIcon } from '../../../../../../shared/src/components/icons'
import { ExtensionsControllerProps } from '../../../../../../shared/src/extensions/controller'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { ThreadSettings } from '../../settings'
import { ThreadStatusItemsProgressBar } from '../activity/ThreadStatusItemsProgressBar'

interface Props extends ExtensionsControllerProps {
    thread: GQL.IDiscussionThread
    onThreadUpdate: (thread: GQL.IDiscussionThread) => void
    threadSettings: ThreadSettings
    areaURL: string
    className?: string
}

/**
 * The sidebar for the thread area (for a single thread).
 */
export const ThreadAreaSidebar: React.FunctionComponent<Props> = ({
    thread,
    onThreadUpdate,
    threadSettings,
    areaURL,
    className = '',
}) => (
    <div className={`thread-area-sidebar d-flex flex-column ${className}`}>
        <div className="card border-0 rounded-0 bg-transparent mb-3">
            <h6 className="card-header">Assignee</h6>
            <div className="card-body bg-transparent">@alice</div>
        </div>
        <div className="card border-0 rounded-0 bg-transparent mb-3">
            <h6 className="card-header">Assignee</h6>
            <div className="card-body bg-transparent">@alice</div>
        </div>
        <div className="card border-0 rounded-0 bg-transparent mb-3">
            <h6 className="card-header">Assignee</h6>
            <div className="card-body bg-transparent">@alice</div>
        </div>
        <div className="card border-0 rounded-0 bg-transparent mb-3">
            <h6 className="card-header">Assignee</h6>
            <div className="card-body bg-transparent">@alice</div>
        </div>
    </div>
)
