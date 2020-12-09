import React from 'react'
import { useNavigate } from 'react-router-dom'
import RegisterMember from './RegisterMember'

const ManageMenbership = (props) => {
    const navigate = useNavigate()

    if (props.user.memberType !== 'Admin') {
        navigate('/dashboard', { replace: true })
    }

    return (
        <div className="manage-membership container">
            <RegisterMember />
        </div>
    )
}

export default ManageMenbership