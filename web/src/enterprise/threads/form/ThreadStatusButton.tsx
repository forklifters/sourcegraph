import { LoadingSpinner } from '@sourcegraph/react-loading-spinner'
import BackupRestoreIcon from 'mdi-react/BackupRestoreIcon'
import CheckIcon from 'mdi-react/CheckIcon'
import React, { useCallback, useState } from 'react'
import { NotificationType } from '../../../../../shared/src/api/client/services/notifications'
import { ExtensionsControllerProps } from '../../../../../shared/src/extensions/controller'
import * as GQL from '../../../../../shared/src/graphql/schema'
import { updateThread } from '../../../discussions/backend'

interface Props {
    thread: Pick<GQL.IDiscussionThread, 'id' | 'status'>
    onThreadUpdate: (thread: GQL.IDiscussionThread) => void
    className?: string
    extensionsController: {
        services: {
            notifications: {
                showMessages: Pick<
                    ExtensionsControllerProps<
                        'services'
                    >['extensionsController']['services']['notifications']['showMessages'],
                    'next'
                >
            }
        }
    }
}

/**
 * A button that changes the status of a thread.
 *
 * TODO!(sqs): currently it only sets it archived ("closed")
 * TODO!(sqs): add tests like for ThreadHeaderEditableTitle
 */
export const ThreadStatusButton: React.FunctionComponent<Props> = ({
    thread,
    onThreadUpdate,
    className = '',
    extensionsController,
}) => {
    const isOpen = thread.status !== GQL.ThreadStatus.CLOSED
    const [isLoading, setIsLoading] = useState(false)
    const onClick = useCallback<React.FormEventHandler>(
        async e => {
            e.preventDefault()
            setIsLoading(true)
            try {
                const updatedThread = await updateThread({ threadID: thread.id, archive: isOpen })
                onThreadUpdate(updatedThread)
            } catch (err) {
                extensionsController.services.notifications.showMessages.next({
                    message: `Error archiving thread: ${err.message}`,
                    type: NotificationType.Error,
                })
            } finally {
                setIsLoading(false)
            }
        },
        [isOpen, isLoading]
    )
    const Icon = isOpen ? CheckIcon : BackupRestoreIcon
    return (
        <button type="submit" disabled={isLoading} className={`btn btn-secondary ${className}`} onClick={onClick}>
            {isLoading ? <LoadingSpinner className="icon-inline" /> : <Icon className="icon-inline" />}{' '}
            {isOpen ? 'Close' : 'Reopen'} thread
        </button>
    )
}
