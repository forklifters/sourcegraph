import { LoadingSpinner } from '@sourcegraph/react-loading-spinner'
import H from 'history'
import React, { useMemo, useState } from 'react'
import { of, throwError } from 'rxjs'
import { first, map } from 'rxjs/operators'
import { WithStickyTop } from '../../../../../../shared/src/components/withStickyTop/WithStickyTop'
import { ExtensionsControllerProps } from '../../../../../../shared/src/extensions/controller'
import { gql } from '../../../../../../shared/src/graphql/graphql'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { asError, createAggregateError, ErrorLike, isErrorLike } from '../../../../../../shared/src/util/errors'
import { queryGraphQL } from '../../../../backend/graphql'
import { search } from '../../../../search/backend'
import { QueryParameterProps } from '../../components/withQueryParameter/WithQueryParameter'
import { ThreadSettings } from '../../settings'
import { TextDocumentLocationSourceItem, ThreadSourceItem } from './TextDocumentLocationSourceItem'
import { ThreadSourceItemsNavbar } from './ThreadSourceItemsNavbar'

const DATA: ThreadSourceItem[] = [
    {
        repo: 'github.com/sourcegraph/go-diff',
        path: 'diff/diff.go',
        line: 34,
        status: 'open',
        updatedAt: new Date(Date.now() - 10000000).toISOString(),
        updatedBy: 'alice',
        commentsCount: 1,
    },
    {
        repo: 'github.com/sourcegraph/codeintellify',
        path: 'src/hoverifier.ts',
        line: 448,
        status: 'open',
        updatedAt: new Date(Date.now() - 5000000).toISOString(),
        updatedBy: 'lguychard',
        commentsCount: 7,
    },
    {
        repo: 'github.com/sourcegraph/codeintellify',
        path: 'src/helpers.ts',
        line: 27,
        status: 'open',
        updatedAt: new Date(Date.now() - 2300000).toISOString(),
        updatedBy: 'felixfbecker',
        commentsCount: 2,
    },
    {
        repo: 'github.com/theupdateframework/notary',
        path: 'server/storage/tuf_store.go',
        line: 24,
        status: 'open',
        updatedAt: new Date(Date.now() - 5300000).toISOString(),
        updatedBy: 'jwhitaker',
        commentsCount: 3,
    },
    {
        repo: 'github.com/sourcegraph/csp',
        path: 'csp.go',
        line: 40,
        status: 'closed',
        updatedAt: new Date(Date.now() - 9300000).toISOString(),
        updatedBy: 'peter91',
        commentsCount: 5,
    },
    {
        repo: 'github.com/sourcegraph/sitemap',
        path: 'sitemap.go',
        line: 81,
        status: 'closed',
        updatedAt: new Date(Date.now() - 4100000).toISOString(),
        updatedBy: 'carol',
        commentsCount: 0,
    },
    {
        repo: 'github.com/sourcegraph/sourcegraph-lightstep',
        path: 'src/extension.ts',
        line: 37,
        status: 'closed',
        updatedAt: new Date(Date.now() - 7100000).toISOString(),
        updatedBy: 'tsenart',
        commentsCount: 1,
    },
    {
        repo: 'github.com/sourcegraph/docsite',
        path: 'markdown/html.go',
        line: 50,
        status: 'closed',
        updatedAt: new Date(Date.now() - 5500000).toISOString(),
        updatedBy: 'felixfbecker',
        commentsCount: 5,
    },
    {
        repo: 'github.com/sourcegraph/docsite',
        path: 'markdown/tree.go',
        line: 27,
        status: 'closed',
        updatedAt: new Date(Date.now() - 3500000).toISOString(),
        updatedBy: 'ryan-blunden',
        commentsCount: 2,
    },
    {
        repo: 'github.com/sourcegraph/thyme',
        path: 'linux.go',
        line: 55,
        status: 'ignored',
        updatedAt: new Date(Date.now() - 100000).toISOString(),
        updatedBy: 'beyang',
        commentsCount: 21,
    },
    {
        repo: 'github.com/sourcegraph/sourcegraph-git-extras',
        path: 'src/blame.ts',
        line: 132,
        status: 'ignored',
        updatedAt: new Date(Date.now() - 6200000).toISOString(),
        updatedBy: 'xyzhao',
        commentsCount: 2,
    },
]

const queryMatches = (
    query: string,
    { extensionsController }: ExtensionsControllerProps
): Promise<GQL.IDiscussionThreadTargetConnection> =>
    search(query, { extensionsController })
        .pipe(
            map(r => {
                if (isErrorLike(r)) {
                    throw new Error(r.message)
                }
                // tslint:disable-next-line: no-object-literal-type-assertion
                return {
                    __typename: 'DiscussionThreadTargetConnection',
                    nodes: r.results
                        .filter((r): r is GQL.IFileMatch => r.__typename === 'FileMatch')
                        .map(
                            (r: GQL.IFileMatch) =>
                                // tslint:disable-next-line: no-object-literal-type-assertion
                                ({
                                    __typename: 'DiscussionThreadTargetRepo',
                                    path: r.file.path,
                                    revision: { __typename: 'GitRef', name: r.file.commit.oid.slice(0, 6) },
                                    repository: r.repository,
                                    url: r.file.url,
                                    selection: {
                                        startLine: r.lineMatches[0].lineNumber,
                                        endLine: r.lineMatches[0].lineNumber,
                                        startCharacter: r.lineMatches[0].offsetAndLengths[0][0],
                                        endCharacter:
                                            r.lineMatches[0].offsetAndLengths[0][0] +
                                            r.lineMatches[0].offsetAndLengths[0][1],
                                    },
                                } as Partial<GQL.IDiscussionThreadTargetRepo>)
                        ),
                    totalCount: r.resultCount,
                    pageInfo: { __typename: 'PageInfo', hasNextPage: r.limitHit },
                } as GQL.IDiscussionThreadTargetConnection
            }),
            first()
        )
        .toPromise()

// TODO!(sqs): use relative path/rev for DiscussionThreadTargetRepo
const querySourceItems = (threadID: GQL.ID): Promise<GQL.IDiscussionThreadTargetConnection> =>
    queryGraphQL(
        gql`
            query ThreadSourceItems($threadID: ID!) {
                node(id: $threadID) {
                    __typename
                    ... on DiscussionThread {
                        targets {
                            nodes {
                                __typename
                                ... on DiscussionThreadTargetRepo {
                                    repository {
                                        name
                                    }
                                    path
                                    branch {
                                        displayName
                                    }
                                    revision {
                                        displayName
                                    }
                                    selection {
                                        startLine
                                        startCharacter
                                        endLine
                                        endCharacter
                                        linesBefore
                                        lines
                                        linesAfter
                                    }
                                    url
                                }
                            }
                            totalCount
                            pageInfo {
                                hasNextPage
                            }
                        }
                    }
                }
            }
        `,
        { threadID }
    )
        .pipe(
            map(({ data, errors }) => {
                if (
                    !data ||
                    !data.node ||
                    data.node.__typename !== 'DiscussionThread' ||
                    !data.node.targets ||
                    !data.node.targets.nodes
                ) {
                    throw createAggregateError(errors)
                }
                return data.node.targets
            })
        )
        .toPromise()

interface Props extends ExtensionsControllerProps, QueryParameterProps {
    thread: Pick<GQL.IDiscussionThread, 'id' | 'title' | 'type'>
    threadSettings: ThreadSettings

    history: H.History
    location: H.Location
    isLightTheme: boolean
}

const LOADING: 'loading' = 'loading'

/**
 * The list of thread source items.
 */
export const ThreadSourceItemsList: React.FunctionComponent<Props> = ({
    thread,
    threadSettings,
    query,
    onQueryChange,
    history,
    location,
    isLightTheme,
    extensionsController,
}) => {
    const [itemsOrError, setItemsOrError] = useState<
        typeof LOADING | GQL.IDiscussionThreadTargetConnection | ErrorLike
    >(LOADING)

    // tslint:disable-next-line: no-floating-promises
    useMemo(async () => {
        try {
            setItemsOrError(
                thread.type === GQL.ThreadType.CHECK
                    ? await queryMatches(threadSettings.query || '', { extensionsController })
                    : await querySourceItems(thread.id)
            )
        } catch (err) {
            setItemsOrError(asError(err))
        }
    }, [thread.id])

    return (
        <div className="thread-source-items-list position-relative">
            {isErrorLike(itemsOrError) ? (
                <div className="alert alert-danger mt-2">{itemsOrError.message}</div>
            ) : (
                <>
                    {itemsOrError !== LOADING && !isErrorLike(itemsOrError) && (
                        <WithStickyTop scrollContainerSelector=".thread-area">
                            {({ isStuck }) => (
                                <ThreadSourceItemsNavbar
                                    thread={thread}
                                    items={itemsOrError}
                                    query={query}
                                    onQueryChange={onQueryChange}
                                    includeThreadInfo={isStuck}
                                    className={`sticky-top position-sticky row bg-body thread-source-items-list__navbar py-2 px-3 ${
                                        isStuck ? 'border-top border-bottom shadow' : ''
                                    }`}
                                    location={location}
                                />
                            )}
                        </WithStickyTop>
                    )}
                    {itemsOrError === LOADING ? (
                        <LoadingSpinner className="mt-2" />
                    ) : itemsOrError.nodes.length === 0 ? (
                        <p className="p-2 mb-0 text-muted">No source items found.</p>
                    ) : (
                        <ul className="list-unstyled">
                            {itemsOrError.nodes.map((item, i) => (
                                <li key={i}>
                                    <TextDocumentLocationSourceItem
                                        key={i}
                                        item={{ ...DATA[i % DATA.length], ...item }}
                                        className="my-3"
                                        isLightTheme={isLightTheme}
                                        history={history}
                                        location={location}
                                        extensionsController={extensionsController}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    )
}
