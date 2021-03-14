import React from 'react'
import PropTypes from 'prop-types'
import MyBooks from '../../dashboard/mybooks'
import LibrarianMain from '../../dashboard/librarianmain'
import AdminAnalytics from '../../dashboard/adminanalytics'

const MainDashboard = ({ user }) => {

    if (user.memberType === 'Member' || user.memberType === 'MemberA' || user.memberType === 'MemberNA') {
        return (
            <MyBooks />
        )
    }
    else if (user.memberType === 'Librarian') {
        return (
            <LibrarianMain />
        )
    }
    else if (user.memberType === 'Admin') {
        return (
            <AdminAnalytics />
        )
    }
}

MainDashboard.propTypes = {
    user: PropTypes.object.isRequired
}

export default MainDashboard