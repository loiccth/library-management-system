import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Container,
    FormControlLabel,
    Switch,
    Toolbar,
    Typography
} from '@material-ui/core'
import RegisterMemberCSV from './RegisterMemberCSV'
import RegisterMember from './RegisterMember'

const RegisterMain = () => {
    const [csv, setCsv] = useState(true)
    const { t } = useTranslation()

    // Toggle between manual or csv
    const handleChange = () => {
        setCsv(!csv)
    }

    return (
        <>
            <Container>
                <Toolbar>
                    <Typography variant="h6">{t('userRegistration')}</Typography>
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
        </>
    )
}

export default RegisterMain