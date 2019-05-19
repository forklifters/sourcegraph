import { LoadingSpinner } from '@sourcegraph/react-loading-spinner'
import CheckIcon from 'mdi-react/CheckIcon'
import PowerPlugIcon from 'mdi-react/PowerPlugIcon'
import PowerPlugOffIcon from 'mdi-react/PowerPlugOffIcon'
import React, { useCallback, useState } from 'react'
import { NotificationType } from '../../../../../../shared/src/api/client/services/notifications'
import { ExtensionsControllerProps } from '../../../../../../shared/src/extensions/controller'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { updateThread } from '../../../../discussions/backend'

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
 * A button that activates or deactivates a check.
 *
 * TODO!(sqs): currently it only sets it archived ("closed")
 * TODO!(sqs): add tests like for ThreadHeaderEditableTitle
 */
export const CheckThreadActivationStatusButton: React.FunctionComponent<Props> = ({
    thread,
    onThreadUpdate,
    className = '',
    extensionsController,
}) => {
    const isActive = thread.status === GQL.ThreadStatus.OPEN_ACTIVE
    const [isLoading, setIsLoading] = useState(false)
    const onClick = useCallback<React.FormEventHandler>(
        async e => {
            e.preventDefault()
            setIsLoading(true)
            try {
                const updatedThread = await updateThread({ threadID: thread.id, active: !isActive })
                onThreadUpdate(updatedThread)
            } catch (err) {
                extensionsController.services.notifications.showMessages.next({
                    message: `Error ${
                        thread.status === GQL.ThreadStatus.INACTIVE ? 'activating' : 'deactivating'
                    } check: ${err.message}`,
                    type: NotificationType.Error,
                })
            } finally {
                setIsLoading(false)
            }
        },
        [isActive, isLoading]
    )
    const Icon = isActive ? PowerPlugOffIcon : PowerPlugIcon
    return thread.status === GQL.ThreadStatus.CLOSED ? null : (
        <button type="submit" disabled={isLoading} className={`btn btn-secondary ${className}`} onClick={onClick}>
            {isLoading ? <LoadingSpinner className="icon-inline" /> : <Icon className="icon-inline" />}{' '}
            {isActive ? 'Deactivate' : 'Activate'} check
        </button>
    )
}
