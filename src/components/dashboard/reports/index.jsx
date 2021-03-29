import React from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import LibrarianReports from './librarian'

const Reports = ({ user, locale }) => {
    const navigate = useNavigate()

    if (user.memberType !== 'Librarian' && user.memberType !== 'Admin') {
        navigate('/dashboard', { replace: true })
    }

    if (user.memberType === 'Librarian') {
        return (
            <LibrarianReports locale={locale} />
        )
    }
    else if (user.memberType === 'Admin') {
        return (
            <>
                hello admin {user.memberType}
            </>
        )
    }
}

Reports.propTypes = {
    user: PropTypes.object.isRequired,
    locale: PropTypes.string.isRequired
}

export default Reports