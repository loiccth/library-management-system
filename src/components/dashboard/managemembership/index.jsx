import React from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import {
    Box,
    Divider,
} from '@material-ui/core'
import RegisterMain from './RegisterMain'
import SearchUsers from './SearchUsers'

const ManageMembership = (props) => {
    const navigate = useNavigate()

    // Redirect if user is not an admin
    if (props.user.memberType !== 'Admin') {
        navigate('/dashboard', { replace: true })
    }

    return (
        <>
            <Box sx={{ my: 5 }}>
                <RegisterMain />
                <Box sx={{ my: 7 }}>
                    <Divider />
                </Box>
                <SearchUsers />
            </Box>
        </>
    )
}

ManageMembership.propTypes = {
    user: PropTypes.object.isRequired
}

export default ManageMembership