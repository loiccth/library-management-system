import React from 'react'
import { useNavigate } from 'react-router-dom'
import RegisterMemberCSV from './RegisterMemberCSV'
import RegisterMember from './RegisterMember'

const ManageMenbership = (props) => {
    const navigate = useNavigate()

    if (props.user.memberType !== 'Admin') {
        navigate('/dashboard', { replace: true })
    }

    return (
        <>
            <RegisterMemberCSV />
            <RegisterMember />
        </>
    )
}

export default ManageMenbership