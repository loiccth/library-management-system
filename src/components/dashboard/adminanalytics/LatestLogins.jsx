import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Box,
    Container,
    Grid,
    makeStyles,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Toolbar,
    Typography,
    Pagination
} from '@material-ui/core'

const LatestLogins = () => {
    const classes = useStyles()
    const [latest, setLatest] = useState([])
    const [page, setPage] = useState(1)
    const { t } = useTranslation()
    const rowPerPage = 5

    // Fetch data on page load
    useEffect(() => {
        const fetchData = async () => {
            // Get latest 10 logins
            const getLatest = await axios.get(`${url}/analytics/latest`, { withCredentials: true })
            setLatest(getLatest.data)
        }
        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Change page
    const handlePagination = (e, value) => {
        setPage(value)
    }


    return (
        <>
            <Container>
                <Toolbar>
                    <Typography variant="h6">{t('latestLogin')}</Typography>
                </Toolbar>
            </Container>
            <Box sx={{ mt: 3 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={12} md={11} lg={10}>
                        <Paper className={classes.paper}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell width={'25%'}>{t('memberDetails')}</TableCell>
                                        <TableCell width={'20%'}>{t('geolocation')}</TableCell>
                                        <TableCell width={'40%'}>{t('deviceDetails')}</TableCell>
                                        <TableCell width={'15%'}>{t('time')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {latest.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">{t('noRecords')}</TableCell>
                                        </TableRow>
                                    }
                                    {latest.slice((page - 1) * rowPerPage, (page - 1) * rowPerPage + rowPerPage).map(row => (
                                        <TableRow key={row._id}>
                                            <TableCell component="th" scope="row">
                                                <Typography variant="caption" display="block">{t('MemberID')}: {row.userid.userid}</Typography>
                                                <Typography variant="caption" display="block">{t('memberType')}: {row.userid.memberType}</Typography>
                                                <Typography variant="caption" display="block">{t('id')}: {row.userid._id}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('ip')}: {row.ip}</Typography>
                                                <Typography variant="caption" display="block">{t('continent')}: {row.geolocation.continentName}</Typography>
                                                <Typography variant="caption" display="block">{t('country')}: {row.geolocation.countryName}</Typography>
                                                <Typography variant="caption" display="block">{t('region')}: {row.geolocation.regionName}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('deviceType')}: {row.device}</Typography>
                                                <Typography variant="caption" display="block">{t('userAgent')}: {row.userAgent}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('date')}: {new Date(row.createdAt).toLocaleString()}</Typography>
                                            </TableCell>
                                            <TableCell>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Grid container justifyContent="center">
                                                <Grid item xs={12}>
                                                    <Pagination
                                                        className={classes.pagination}
                                                        count={Math.ceil(latest.length / rowPerPage)}
                                                        page={page}
                                                        onChange={handlePagination}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </>
    )
}

const useStyles = makeStyles(theme => ({
    paper: {
        overflowX: 'auto'
    },
    table: {
        minWidth: 850
    },
    heading: {
        justifyContent: 'flex-end',
        [theme.breakpoints.down("sm")]: {
            justifyContent: 'center'
        }
    },
    highpriority: {
        color: 'red'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center'
    }
}))

export default LatestLogins