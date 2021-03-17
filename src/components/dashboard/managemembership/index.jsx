import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import {
    Box,
    Divider,
    Container,
    FormControlLabel,
    Switch,
    Toolbar,
    Typography
} from '@material-ui/core'
import RegisterMemberCSV from './RegisterMemberCSV'
import RegisterMember from './RegisterMember'
import SearchUsers from './SearchUsers'

const ManageMenbership = (props) => {
    const navigate = useNavigate()
    const [csv, setCsv] = useState(true)

    const handleChange = () => {
        setCsv(!csv)
    }

    if (props.user.memberType !== 'Admin') {
        navigate('/dashboard', { replace: true })
    }

    return (
        <>
            <Box sx={{ my: 5 }}>
                <Container>
                    <Toolbar>
                        <Typography variant="h6">User registration</Typography>
                    </Toolbar>
                    <FormControlLabel
                        control={<Switch name="csv" checked={!csv} onChange={handleChange} />}
                        label="Manual registration"
                    />
                </Container>
                {csv ?
                    <RegisterMemberCSV />
                    :
                    <RegisterMember />
                }
                <Box sx={{ my: 7 }}>
                    <Divider />
                </Box>
                <SearchUsers />
            </Box>
        </>
    )
}

ManageMenbership.propTypes = {
    user: PropTypes.object.isRequired
}

export default ManageMenbership