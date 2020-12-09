import React from 'react'
import ProfileDetails from './ProfileDetails'
import ChangePassword from './ChangePassword'

const Profile = (props) => {
    return (
        <div className="container">
            <ProfileDetails user={props.user} />
            <ChangePassword handlePasswordChange={props.handlePasswordChange} />
        </div>
    )
}

export default Profile