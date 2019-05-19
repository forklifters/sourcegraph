import * as GQL from '../../../../shared/src/graphql/schema'

export function threadNoun(kind: GQL.ThreadType, plural = false): string {
    return `${kind.toLowerCase()}${plural ? 's' : ''}`
}
