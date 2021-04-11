import React from 'react'
import PropTypes from 'prop-types'
import { Box, Divider } from '@material-ui/core'
import AnalyticsReport from './AnalyticsReport'
import MembersReport from './MembersReport'

const AdminReports = ({ locale }) => {
    return (
        <>
            <Box sx={{ my: 5 }}>
                <AnalyticsReport locale={locale} />
                <Box sx={{ my: 3 }}>
                    <Divider />
                </Box>
                <MembersReport locale={locale} />
            </Box>
        </>
    )
}

AdminReports.propTypes = {
    locale: PropTypes.string.isRequired
}

export default AdminReports