import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Box,
    Container,
    Divider,
    Grid,
    Toolbar,
    Typography
} from '@material-ui/core'
import Statistics from './Statistics'
import SessionsChart from './SessionsChart'
import DevicesPie from './DevicesPie'
import LatestLogins from './LatestLogins'

const AdminAnalytics = () => {
    const [loading, setLoading] = useState(true)
    const [sessions, setSessions] = useState({})
    const [devices, setDevices] = useState({})
    const { t } = useTranslation()

    // Fetch data on page load
    useEffect(() => {
        const fetchData = async () => {
            // Get sessions details for barchart
            const tempSession = await axios.get(`${url}/analytics/sessions`, { withCredentials: true })
            setSessions(tempSession.data)
            // Get device types for piechart
            const tempDevices = await axios.get(`${url}/analytics/devices`, { withCredentials: true })
            setDevices(tempDevices.data)

            setLoading(false)
        }
        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <Box sx={{ my: 5 }}>
                <Container>
                    <Toolbar>
                        <Typography variant="h6">{t('stats')}</Typography>
                    </Toolbar>
                </Container>
                <Box sx={{ my: 3 }}>
                    <Statistics />
                    <Box sx={{ my: 5 }}>
                        <Divider />
                    </Box>
                    <Grid container justifyContent="center">
                        <Grid item xs={11} md={10}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={7}>
                                    {loading ? null : <SessionsChart sessions={sessions} />}
                                </Grid>
                                <Grid item xs={12} md={5}>
                                    {loading ? null : <DevicesPie devices={devices} />}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Box sx={{ my: 5 }}>
                        <Divider />
                    </Box>
                    <LatestLogins />
                </Box>
            </Box>
        </>
    )
}

export default AdminAnalytics