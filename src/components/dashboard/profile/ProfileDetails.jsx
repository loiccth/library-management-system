import React from 'react'
import PropTypes from 'prop-types'

const ProfileDetails = ({ user }) => {
    return (
        <div className="profile-details">
            <ul>
                <img src="" alt="zimage-dimoun-la-ici" />
                <li>{user.memberType}</li>
                <li>{user.email}</li>
                <li>{user.phone}</li>
            </ul>
        </div>
    )
}

ProfileDetails.propTypes = {
    user: PropTypes.object.isRequired
}

export default ProfileDetails