import { LoadingSpinner } from '@sourcegraph/react-loading-spinner'
import H from 'history'
import AddIcon from 'mdi-react/AddIcon'
import React, { useCallback, useState } from 'react'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { asError, ErrorLike, isErrorLike } from '../../../../../../shared/src/util/errors'
import { Form } from '../../../../components/Form'
import { createThread } from '../../../../discussions/backend'
import { ThreadTitleFormGroup } from '../../../threads/form/ThreadTitleFormGroup'
import { CheckType } from '../../components/CheckTypeItem'

interface Props {
    checkType: CheckType
    className?: string
    history: H.History
}

const LOADING: 'loading' = 'loading'

/**
 * A form to create a new check thread.
 */
export const NewCheckThreadForm: React.FunctionComponent<Props> = ({ checkType, className = '', history }) => {
    const [title, setTitle] = useState(checkType.title)
    const onTitleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
        e => setTitle(e.currentTarget.value),
        [title]
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
                    type: GQL.ThreadType.THREAD,
                    settings: JSON.stringify({ types: [checkType.id] }, null, 2),
                    status: GQL.ThreadStatus.INACTIVE,
                }).toPromise()
                setCreationOrError(thread)
                history.push(thread.url)
            } catch (err) {
                setCreationOrError(asError(err))
            }
        },
        [title, creationOrError]
    )

    return (
        <Form className={`form ${className}`} onSubmit={onSubmit}>
            <ThreadTitleFormGroup value={title} onChange={onTitleChange} disabled={creationOrError === LOADING} />
            <button type="submit" disabled={creationOrError === LOADING} className="btn btn-primary">
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
