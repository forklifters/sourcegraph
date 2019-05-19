import React from 'react'
import { Toggle } from '../../../../../../shared/src/components/Toggle'
import { ExtensionsControllerProps } from '../../../../../../shared/src/extensions/controller'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { ThreadSettings } from '../../settings'
import { CopyThreadLinkButton } from './CopyThreadLinkButton'

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
export const ThreadAreaSidebar: React.FunctionComponent<Props> = ({ thread, className = '' }) => (
    <div className={`thread-area-sidebar d-flex flex-column ${className}`}>
        <ul className="list-group list-group-flush px-2">
            <li className="list-group-item py-3">
                <h6>Assignee</h6>
                <div>
                    <strong>@sqs</strong>
                </div>
            </li>
            <li className="list-group-item py-3">
                <h6>Labels</h6>
                <div>
                    {thread.title
                        .toLowerCase()
                        .split(' ')
                        .filter(w => w.length >= 3)
                        .map((label, i) => (
                            <span key={i} className={`badge mr-1 ${badgeColorClass(label)}`}>
                                {label}
                            </span>
                        ))}
                </div>
            </li>
            <li className="list-group-item py-3">
                <h6>3 participants</h6>
                <div className="text-muted">@sqs @alice @bob @carol</div>
            </li>
            <li className="list-group-item py-3">
                <h6 className="mb-0 d-flex align-items-center justify-content-between">
                    Notifications <Toggle value={true} />
                </h6>
            </li>
            <li className="list-group-item py-3">
                <h6 className="mb-0 d-flex align-items-center justify-content-between">
                    Link
                    <CopyThreadLinkButton link={thread.url} className="btn btn-link btn-link-sm px-0" />
                </h6>
            </li>
        </ul>
    </div>
)

function badgeColorClass(label: string): string {
    if (label === 'security' || label.endsWith('sec')) {
        return 'badge-danger'
    }
    const CLASSES = ['badge-primary', 'badge-warning', 'badge-info', 'badge-success']
    const k = label.split('').reduce((sum, c) => (sum += c.charCodeAt(0)), 0)
    return CLASSES[k % (CLASSES.length - 1)]
}
