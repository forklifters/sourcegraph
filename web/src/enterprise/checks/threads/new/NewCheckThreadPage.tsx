import H from 'history'
import React from 'react'
import { Link } from 'react-router-dom'
import { PageTitle } from '../../../../components/PageTitle'
import { CheckTypeItem } from '../../components/CheckTypeItem'
import { CHECK_TYPES } from '../../contributions/sampleCheckTypes'
import { NewCheckThreadForm } from './NewCheckThreadForm'
import { CheckThreadTypeSelectFormControl } from './NewCheckThreadSelectTypePage'

interface Props {
    history: H.History
    location: H.Location
}

const urlForType = (typeId: string | null): H.LocationDescriptor => {
    const params = typeId !== null ? new URLSearchParams({ type: typeId }) : ''
    return `/checks/new?${params}`
}

export const NewCheckThreadPage: React.FunctionComponent<Props> = ({ history, location }) => {
    const typeId = new URLSearchParams(location.search).get('type')
    const type = CHECK_TYPES.find(({ id }) => id === typeId)

    return (
        <div className="new-check-thread-page container mt-4">
            <PageTitle title="New check" />
            <h1 className="mb-3">New check</h1>
            <div className="row">
                <div className="col-md-9 col-lg-8 col-xl-7">
                    <label>Type</label>
                    {!type ? (
                        <CheckThreadTypeSelectFormControl urlForType={urlForType} />
                    ) : (
                        <>
                            <CheckTypeItem
                                checkType={type}
                                className="border rounded"
                                endFragment={
                                    <Link
                                        to={urlForType(null)}
                                        className="btn btn-secondary text-decoration-none"
                                        data-tooltip="Choose a different type"
                                    >
                                        Change
                                    </Link>
                                }
                            />
                            <NewCheckThreadForm checkType={type} className="mt-3" history={history} />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
