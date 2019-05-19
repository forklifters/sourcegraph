import { LoadingSpinner } from '@sourcegraph/react-loading-spinner'
import H from 'history'
import AddIcon from 'mdi-react/AddIcon'
import React, { useCallback, useState } from 'react'
import { CheckTemplate } from '../../../../../../shared/src/api/client/services/checkTemplates'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { asError, ErrorLike, isErrorLike } from '../../../../../../shared/src/util/errors'
import { Form } from '../../../../components/Form'
import { createThread } from '../../../../discussions/backend'
import { ThreadTitleFormGroup } from '../../../threads/form/ThreadTitleFormGroup'

interface Props {
    checkTemplate: CheckTemplate
    className?: string
    history: H.History
}

const LOADING: 'loading' = 'loading'

/**
 * A form to create a new check thread.
 */
export const NewCheckThreadForm: React.FunctionComponent<Props> = ({ checkTemplate, className = '', history }) => {
    const [title, setTitle] = useState(checkTemplate.title)
    const onTitleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
        e => setTitle(e.currentTarget.value),
        [title]
    )

    const [status, setStatus] = useState(GQL.ThreadStatus.INACTIVE)
    const onStatusChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
        e => setStatus(e.currentTarget.value as GQL.ThreadStatus),
        [status]
    )

    const [creationOrError, setCreationOrError] = useState<null | typeof LOADING | GQL.IDiscussionThread | ErrorLike>(
        null
    )
    const onSubmit = useCallback<React.FormEventHandler>(
        async e => {
            e.preventDefault()
            setCreationOrError(LOADING)
            try {
                const thread = await createThread({
                    title,
                    contents: '',
                    type: GQL.ThreadType.CHECK,
                    settings: JSON.stringify(checkTemplate.settings || {}, null, 2),
                    status,
                }).toPromise()
                setCreationOrError(thread)
                history.push(thread.url)
            } catch (err) {
                setCreationOrError(asError(err))
            }
        },
        [title, status, creationOrError]
    )

    return (
        <Form className={`form ${className}`} onSubmit={onSubmit}>
            <ThreadTitleFormGroup value={title} onChange={onTitleChange} disabled={creationOrError === LOADING} />
            <div className="form-group row">
                <legend className="col-sm-2 pt-0 col-form-label text-nowrap">Initial status</legend>
                <div className="col-sm-10">
                    <div className="form-check mb-2">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="new-check-thread-form__status"
                            id="new-check-thread-form__status-inactive"
                            value={GQL.ThreadStatus.INACTIVE}
                            checked={status === GQL.ThreadStatus.INACTIVE}
                            onChange={onStatusChange}
                        />
                        <label className="form-check-label" htmlFor="new-check-thread-form__status-inactive">
                            Inactive <span className="text-muted">(recommended)</span>
                        </label>
                        <small className="form-text text-muted">
                            You can preview this check's behavior after creation before it performs actions or sends
                            notifications.
                        </small>
                    </div>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="new-check-thread-form__status"
                            id="new-check-thread-form__status-active"
                            value={GQL.ThreadStatus.OPEN_ACTIVE}
                            checked={status === GQL.ThreadStatus.OPEN_ACTIVE}
                            onChange={onStatusChange}
                        />
                        <label className="form-check-label" htmlFor="new-check-thread-form__status-active">
                            Active
                        </label>
                        <small className="form-text text-muted">
                            This check may immediately start performing actions and sending notifications.
                        </small>
                    </div>
                </div>
            </div>
            {status === GQL.ThreadStatus.OPEN_ACTIVE && (
                <div className="alert alert-warning">
                    Active checks will immediately start performing actions and sending notifications. Select{' '}
                    <strong>Inactive</strong> to preview or customize its behavior first.
                </div>
            )}
            <button type="submit" disabled={creationOrError === LOADING} className="btn btn-primary mt-2">
                {creationOrError === LOADING ? (
                    <LoadingSpinner className="icon-inline" />
                ) : (
                    <AddIcon className="icon-inline" />
                )}{' '}
                Create check
            </button>
            {isErrorLike(creationOrError) && <div className="alert alert-danger mt-3">{creationOrError.message}</div>}
        </Form>
    )
}
