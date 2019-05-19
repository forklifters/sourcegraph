import H from 'history'
import ChevronRightIcon from 'mdi-react/ChevronRightIcon'
import React, { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckTypeItem } from '../../components/CheckTypeItem'
import { CHECK_TYPES } from '../../contributions/sampleCheckTypes'

interface Props {
    urlForType: (typeId: string) => H.LocationDescriptor
}

/**
 * A list of possible types for a new check.
 */
export const CheckThreadTypeSelectFormControl: React.FunctionComponent<Props> = ({ urlForType }) => {
    const [query, setQuery] = useState('')
    const onQueryChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
        e => setQuery(e.currentTarget.value),
        [query]
    )

    return (
        <ul className="list-group">
            <li className="list-group-item p-0">
                <input
                    type="search"
                    className="form-control border-0 px-3 py-2 rounded-bottom-0"
                    value={query}
                    onChange={onQueryChange}
                    placeholder="Search"
                />
            </li>
            {CHECK_TYPES.filter(
                ({ title, description }) =>
                    title.toLowerCase().includes(query.toLowerCase()) ||
                    (description && description.toLowerCase().includes(query.toLowerCase()))
            ).map((checkType, i) => (
                <CheckTypeItem
                    key={i}
                    element="li"
                    checkType={checkType}
                    className="list-group-item list-group-item-action position-relative"
                    endFragment={
                        <Link
                            to={urlForType(checkType.id)}
                            className="stretched-link mb-0 text-decoration-none d-flex align-items-center text-body"
                        />
                    }
                />
            ))}
        </ul>
    )
}
