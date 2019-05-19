import AlertCircleIcon from 'mdi-react/AlertCircleIcon'
import MapSearchIcon from 'mdi-react/MapSearchIcon'
import React, { useMemo, useState } from 'react'
import { Route, RouteComponentProps, Switch } from 'react-router'
import { Resizable } from '../../../../../shared/src/components/Resizable'
import * as GQL from '../../../../../shared/src/graphql/schema'
import { asError, ErrorLike, isErrorLike } from '../../../../../shared/src/util/errors'
import { ErrorBoundary } from '../../../components/ErrorBoundary'
import { HeroPage } from '../../../components/HeroPage'
import { fetchDiscussionThreadAndComments } from '../../../discussions/backend'
import { parseJSON } from '../../../settings/configuration'
import { ThreadsAreaContext } from '../global/ThreadsArea'
import { ThreadSettings } from '../settings'
import { ThreadActivityPage } from './activity/ThreadActivityPage'
import { ThreadDiscussionPage } from './discussion/ThreadDiscussionPage'
import { ThreadManagePage } from './manage/ThreadManagePage'
import { ThreadAreaHeader } from './overview/ThreadAreaHeader'
import { ThreadOverview } from './overview/ThreadOverview'
import { ThreadAreaSidebar } from './sidebar/ThreadAreaSidebar'
import { ThreadSourcesPage } from './sources/ThreadSourcesPage'

const NotFoundPage = () => (
    <HeroPage icon={MapSearchIcon} title="404: Not Found" subtitle="Sorry, the requested  page was not found." />
)

interface Props extends ThreadsAreaContext, RouteComponentProps<{ threadID: string }> {}

const LOADING: 'loading' = 'loading'

/**
 * The area for a single thread.
 */
export const ThreadArea: React.FunctionComponent<Props> = props => {
    const [threadOrError, setThreadOrError] = useState<typeof LOADING | GQL.IDiscussionThread | ErrorLike>(LOADING)

    // tslint:disable-next-line: no-floating-promises beacuse fetchDiscussionThreadAndComments never throws
    useMemo(async () => {
        try {
            setThreadOrError(await fetchDiscussionThreadAndComments(props.match.params.threadID).toPromise())
        } catch (err) {
            setThreadOrError(asError(err))
        }
    }, [props.match.params.threadID])

    if (threadOrError === LOADING) {
        return null // loading
    }
    if (isErrorLike(threadOrError)) {
        return <HeroPage icon={AlertCircleIcon} title="Error" subtitle={threadOrError.message} />
    }

    const context: ThreadsAreaContext & {
        thread: GQL.IDiscussionThread
        onThreadUpdate: (thread: GQL.IDiscussionThread | ErrorLike) => void
        threadSettings: ThreadSettings
        areaURL: string
    } = {
        ...props,
        thread: threadOrError,
        onThreadUpdate: thread => setThreadOrError(thread),
        threadSettings: parseJSON(threadOrError.settings),
        areaURL: props.match.url,
    }

    return (
        <div className="thread-area border-top flex-1 d-flex flex-row-reverse">
            <Resizable
                className="thread-area__sidebar-resizable border-left"
                handlePosition="left"
                storageKey="thread-area__sidebar-resizable"
                defaultSize={216 /* px */}
                element={<ThreadAreaSidebar {...context} className="thread-area__sidebar flex-1 overflow-auto" />}
            />
            <div className="flex-1 overflow-auto">
                <ErrorBoundary location={props.location}>
                    <ThreadOverview {...context} location={props.location} history={props.history} />
                </ErrorBoundary>
                <ErrorBoundary location={props.location}>
                    <Switch>
                        <Route
                            path={props.match.url}
                            key="hardcoded-key" // see https://github.com/ReactTraining/react-router/issues/4578#issuecomment-334489490
                            exact={true}
                            // tslint:disable-next-line:jsx-no-lambda
                            render={routeComponentProps => (
                                <ThreadDiscussionPage {...routeComponentProps} {...context} />
                            )}
                        />
                        <Route
                            path={`${props.match.url}/sources`}
                            key="hardcoded-key" // see https://github.com/ReactTraining/react-router/issues/4578#issuecomment-334489490
                            exact={true}
                            // tslint:disable-next-line:jsx-no-lambda
                            render={routeComponentProps => <ThreadSourcesPage {...routeComponentProps} {...context} />}
                        />
                        <Route
                            path={`${props.match.url}/activity`}
                            key="hardcoded-key" // see https://github.com/ReactTraining/react-router/issues/4578#issuecomment-334489490
                            exact={true}
                            // tslint:disable-next-line:jsx-no-lambda
                            render={routeComponentProps => <ThreadActivityPage {...routeComponentProps} {...context} />}
                        />
                        <Route
                            path={`${props.match.url}/manage`}
                            key="hardcoded-key" // see https://github.com/ReactTraining/react-router/issues/4578#issuecomment-334489490
                            exact={true}
                            // tslint:disable-next-line:jsx-no-lambda
                            render={routeComponentProps => <ThreadManagePage {...routeComponentProps} {...context} />}
                        />
                        <Route key="hardcoded-key" component={NotFoundPage} />
                    </Switch>
                </ErrorBoundary>
            </div>
        </div>
    )
}
