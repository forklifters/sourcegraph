import H from 'history'
import React from 'react'
import { ExtensionsControllerProps } from '../../../../../../shared/src/extensions/controller'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { ErrorLike } from '../../../../../../shared/src/util/errors'
import { Timestamp } from '../../../../components/time/Timestamp'
import { DiscussionsThread } from '../../../../repo/blob/discussions/DiscussionsThread'
import { PersonLink } from '../../../../user/PersonLink'
import { CheckThreadActivationStatusButton } from '../../../checks/threads/form/CheckThreadActivationStatusButton'
import { ThreadStatusBadge } from '../../components/threadStatus/ThreadStatusBadge'
import { ThreadDeleteButton } from '../../form/ThreadDeleteButton'
import { ThreadStatusButton } from '../../form/ThreadStatusButton'
import { ThreadSettings } from '../../settings'
import { ThreadAreaHeader } from './ThreadAreaHeader'
import { ThreadBreadcrumbs } from './ThreadBreadcrumbs'

interface Props extends ExtensionsControllerProps {
    thread: GQL.IDiscussionThread
    onThreadUpdate: (thread: GQL.IDiscussionThread | ErrorLike) => void
    threadSettings: ThreadSettings

    history: H.History
    location: H.Location
}

/**
 * The overview for a single thread.
 */
export const ThreadOverview: React.FunctionComponent<Props> = ({
    thread,
    onThreadUpdate,
    threadSettings,
    ...props
}) => (
    <div className="thread-overview container">
        <ThreadBreadcrumbs thread={thread} className="py-3" />
        <hr className="my-0" />
        <div className="d-flex align-items-center py-3">
            <ThreadStatusBadge thread={thread} className="mr-2" />
            <span>
                Opened <Timestamp date={thread.createdAt} /> by <PersonLink user={thread.author} />
            </span>
            <div className="flex-1" />
            {thread.type === GQL.ThreadType.CHECK && thread.status !== GQL.ThreadStatus.CLOSED && (
                <CheckThreadActivationStatusButton
                    {...props}
                    thread={thread}
                    onThreadUpdate={onThreadUpdate}
                    className="mr-2"
                    buttonClassName={thread.status === GQL.ThreadStatus.INACTIVE ? 'btn-success' : 'btn-outline-link'}
                />
            )}
            <ThreadStatusButton
                {...props}
                thread={thread}
                onThreadUpdate={onThreadUpdate}
                className="mr-2"
                buttonClassName="btn-outline-warning"
            />
            <ThreadDeleteButton
                {...props}
                thread={thread}
                className="mr-2"
                buttonClassName="btn-outline-danger"
                textLabel={false}
            />
        </div>
        <ThreadAreaHeader
            {...props}
            thread={thread}
            onThreadUpdate={onThreadUpdate}
            threadSettings={threadSettings}
            className="thread-area__header border-bottom"
        />
    </div>
)
