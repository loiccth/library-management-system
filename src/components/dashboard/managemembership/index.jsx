import React from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
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

ManageMenbership.propTypes = {
    user: PropTypes.object.isRequired
}

export default ManageMenbership