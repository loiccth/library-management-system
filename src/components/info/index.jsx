import { React, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Trans, useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../settings/api'
import {
    Box,
    Container,
    Grid,
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from '@material-ui/core'
import Navbar from '../navbar/Navbar'
import Footer from '../navbar/Footer'

const Info = (props) => {
    const classes = useStyles()
    const [info, setInfo] = useState()
    const [loading, setLoading] = useState(true)
    const { t } = useTranslation()

    useEffect(() => {
        axios.get(`${url}/settings/info`)
            .then((result) => {
                setInfo(result.data)
                setLoading(false)
            })
    }, [])

    return (
        <>
            <Navbar user={props.user} darkMode={props.darkMode} handleToggleTheme={props.handleToggleTheme} handleLocale={props.handleLocale} handleLogout={props.handleLogout} />
            {loading ? null :
                <>
                    <Box className={classes.wrapper}>
                        <Box sx={{ my: 3 }} className={classes.container}>
                            <Container>
                                <Grid container justifyContent="center" spacing={3}>
                                    <Grid item xs={10} sm={10} md={8} lg={8} xl={7}>
                                        <Typography variant="h6">{t('vision')}</Typography>
                                        <Typography variant="body1">
                                            {t('visionMsg')}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={10} sm={10} md={8} lg={8} xl={7}>
                                        <Typography variant="h6">{t('mission')}</Typography>
                                        <Typography variant="body1">
                                            {t('missionMsg')}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={10} sm={7} md={5} lg={5} xl={6}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center">{t('information')}</TableCell>

                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <TableRow><TableCell>
                                                    <Trans i18nKey="tempPassword"> <strong>{{ time: info.user.temp_password.value }}</strong> </Trans>
                                                </TableCell></TableRow>
                                                <TableRow><TableCell>
                                                    <Trans i18nKey="maxReserve"> <strong>{{ num: info.book.number_of_reservations.value }}</strong> </Trans>
                                                </TableCell></TableRow>
                                                <TableRow><TableCell>
                                                    <Trans i18nKey="holdTime"> <strong>{{ time: info.book.time_onhold.value }}</strong> </Trans>
                                                </TableCell></TableRow>
                                                <TableRow><TableCell>
                                                    <Trans i18nKey="studentBorrow"> <strong>{{ num: info.user.student_borrow.value }}</strong> </Trans>
                                                </TableCell></TableRow>
                                                <TableRow><TableCell>
                                                    <Trans i18nKey="academicBorrow"> <strong>{{ num: info.user.academic_borrow.value }}</strong> </Trans>
                                                </TableCell></TableRow>
                                                <TableRow><TableCell>
                                                    <Trans i18nKey="nonAcademicBorrow"> <strong>{{ num: info.user.non_academic_borrow.value }}</strong> </Trans>
                                                </TableCell></TableRow>
                                                <TableRow><TableCell>
                                                    <Trans i18nKey="maxRenewal"> <strong>{{ num: info.book.renewals_allowed.value }}</strong> </Trans>
                                                </TableCell></TableRow>
                                                <TableRow><TableCell>
                                                    <Trans i18nKey="highDemandIssue"> <strong>{{ time: 30 }}</strong> </Trans>
                                                </TableCell></TableRow>
                                                <TableRow><TableCell>
                                                    <Trans i18nKey="highDemandReturn"> <strong>{{ time: 30 }}</strong> </Trans>
                                                </TableCell></TableRow>
                                                <TableRow><TableCell>
                                                    <Trans i18nKey="finePerDay"> <strong>{{ amount: info.book.fine_per_day.value }}</strong> </Trans>
                                                </TableCell></TableRow>
                                            </TableBody>
                                        </Table>
                                    </Grid>
                                    <Grid item xs={10} sm={7} md={5} lg={4} xl={4}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center">{t('day')}</TableCell>
                                                    <TableCell align="center">{t('openingHrs')}</TableCell>
                                                    <TableCell align="center">{t('closingHrs')}</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {info.hours.map((day, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell align="center">{t(day.day)}</TableCell>
                                                        <TableCell align="center">{new Date(day.open).getHours() === 0 ? <span className={classes.close}>{t('closed')}</span> : new Date(day.open).toLocaleTimeString()}</TableCell>
                                                        <TableCell align="center">{new Date(day.close).getHours() === 0 ? <span className={classes.close}>{t('closed')}</span> : new Date(day.close).toLocaleTimeString()}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Grid>
                                </Grid>
                            </Container>
                        </Box>
                        <Footer />
                    </Box>
                </>
            }
        </>
    )
}

const useStyles = makeStyles(theme => ({
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
        [theme.breakpoints.up("sm")]: {
            minHeight: `calc(100vh - 64px)`
        },
        [theme.breakpoints.down("xs")]: {
            minHeight: `calc(100vh - 48px)`
        }
    },
    container: {
        flex: 1
    },
    close: {
        color: 'red'
    }
}))

Info.propTypes = {
    user: PropTypes.object.isRequired,
    darkMode: PropTypes.bool.isRequired,
    handleToggleTheme: PropTypes.func.isRequired,
    handleLocale: PropTypes.func.isRequired,
    handleLogout: PropTypes.func.isRequired
}

export default Info