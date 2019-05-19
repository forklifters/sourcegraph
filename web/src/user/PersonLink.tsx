import * as React from 'react'
import { Link } from 'react-router-dom'
import * as GQL from '../../../shared/src/graphql/schema'

/**
 * A person's name, with a link to their Sourcegraph user profile if an associated user is found.
 */
export const PersonLink: React.FunctionComponent<{
    displayName?: string
    user?: GQL.IUser | null
    className?: string
    userClassName?: string
}> = ({ displayName, user, className = '', userClassName }) => (
    <>
        {displayName && (
            <>
                <span className={className}>{displayName}</span>
                {user && <> &mdash; </>}
            </>
        )}
        {user && (
            <Link
                to={user.url}
                className={`${className} ${userClassName || ''}`}
                title={user.displayName || displayName}
            >
                {user.username}
            </Link>
        )}
    </>
)
