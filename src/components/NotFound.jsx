import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Box, Typography } from '@material-ui/core'
import logo from '../img/logo.png'
import whitelogo from '../img/logo_white.png'

// Page not found
const NotFound = ({ darkMode }) => {
    return (
        <>
            <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <Link to='/'>
                    <img src={darkMode ? whitelogo : logo} alt="udmlogo" style={{ maxHeight: '100px', maxWidth: 'auto' }} />
                </Link>
                <Typography variant="h6" display="block">404 Page not found 😔</Typography>
            </Box>
        </>
    )
}

NotFound.propTypes = {
    darkMode: PropTypes.bool.isRequired
}

export default NotFound