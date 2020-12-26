import React from 'react'

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

export default ProfileDetails