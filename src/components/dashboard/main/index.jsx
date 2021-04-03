import React from 'react'
import PropTypes from 'prop-types'
import MyBooks from '../../dashboard/mybooks'
import LibrarianMain from '../../dashboard/librarianmain'
import AdminAnalytics from '../../dashboard/adminanalytics'

const MainDashboard = ({ user, locale }) => {

    if (user.memberType === 'Member' || user.memberType === 'MemberA' || user.memberType === 'MemberNA') {
        return (
            <MyBooks user={user} />
        )
    }
    else if (user.memberType === 'Librarian') {
        return (
            <LibrarianMain locale={locale} />
        )
    }
    else if (user.memberType === 'Admin') {
        return (
            <AdminAnalytics />
        )
    }
}

MainDashboard.propTypes = {
    user: PropTypes.object.isRequired,
    locale: PropTypes.string.isRequired
}

export default MainDashboard