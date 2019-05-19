import MapSearchIcon from 'mdi-react/MapSearchIcon'
import React from 'react'
import { Route, RouteComponentProps, Switch } from 'react-router'
import { ExtensionsControllerProps } from '../../../../../shared/src/extensions/controller'
import { HeroPage } from '../../../components/HeroPage'
import { ThreadsAreaContext } from '../../threads/global/ThreadsArea'
import { ChecksOverviewPage } from '../overview/ChecksOverviewPage'
import { NewCheckThreadPage } from '../threads/new/NewCheckThreadPage'

const NotFoundPage: React.FunctionComponent = () => (
    <HeroPage icon={MapSearchIcon} title="404: Not Found" subtitle={`Sorry, the requested page was not found.`} />
)

/**
 * Properties passed to all page components in the checks area.
 */
export interface ChecksAreaContext extends ThreadsAreaContext {}

export interface ThreadsAreaProps
    extends Pick<ChecksAreaContext, 'isLightTheme'>,
        RouteComponentProps<{}>,
        ExtensionsControllerProps {}

/**
 * The global checks area.
 */
export const ChecksArea: React.FunctionComponent<ThreadsAreaProps> = ({ match, ...props }) => {
    const context: ChecksAreaContext = {
        ...props,
        kind: 'check',
    }

    return (
        <div className="checks-area area--vertical pt-0">
            <Switch>
                <Route
                    path={match.url}
                    key="hardcoded-key" // see https://github.com/ReactTraining/react-router/issues/4578#issuecomment-334489490
                    exact={true}
                    // tslint:disable-next-line:jsx-no-lambda
                    render={routeComponentProps => <ChecksOverviewPage {...routeComponentProps} {...context} />}
                />
                <Route
                    path={`${match.url}/new`}
                    key="hardcoded-key" // see https://github.com/ReactTraining/react-router/issues/4578#issuecomment-334489490
                    // tslint:disable-next-line:jsx-no-lambda
                    render={routeComponentProps => <NewCheckThreadPage {...routeComponentProps} {...context} />}
                />
                <Route key="hardcoded-key" component={NotFoundPage} />
            </Switch>
        </div>
    )
}
