import React from 'react'
import PropTypes from 'prop-types'
import { Box, Typography } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

const ProfileDetails = ({ user }) => {
    const { t } = useTranslation()

    return (
        <Box>
            <Typography variant="body1">{t('memberid')}: {user.userid}</Typography>
            <Typography variant="body1">{t('memberType')}: {user.memberType}</Typography>
            <Typography variant="body1">{t('email')}: {user.email}</Typography>
            <Typography variant="body1">{t('phone')}: {user.phone}</Typography>
        </Box>
    )
}

ProfileDetails.propTypes = {
    user: PropTypes.object.isRequired
}

export default ProfileDetails