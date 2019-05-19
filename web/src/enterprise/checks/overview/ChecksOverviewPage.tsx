import H from 'history'
import React from 'react'
import { Link } from 'react-router-dom'
import { PageTitle } from '../../../components/PageTitle'
import { WithQueryParameter } from '../../threads/components/withQueryParameter/WithQueryParameter'
import { threadsQueryWithValues } from '../../threads/url'
import { ChecksAreaContext } from '../global/ChecksArea'
import { ChecksIcon } from '../icons'
import { CheckThreadsList } from '../threads/list/CheckThreadsList'

interface Props extends ChecksAreaContext {
    history: H.History
    location: H.Location
}

/**
 * The checks overview page.
 */
export const ChecksOverviewPage: React.FunctionComponent<Props> = props => (
    <div className="checks-overview-page mt-3 container">
        <PageTitle title="Checks" />
        <div className="d-flex align-items-center justify-content-between mb-3">
            <h1 className="h3 mb-0 d-flex align-items-center">
                <ChecksIcon className="icon-inline mr-1" /> Checks
            </h1>
            <Link to="/checks/new" className="btn btn-success">
                New check
            </Link>
        </div>
        <WithQueryParameter
            defaultQuery={threadsQueryWithValues('', { is: [props.type, 'open'] })}
            history={props.history}
            location={props.location}
        >
            {({ query, onQueryChange }) => <CheckThreadsList {...props} query={query} onQueryChange={onQueryChange} />}
        </WithQueryParameter>
    </div>
)
