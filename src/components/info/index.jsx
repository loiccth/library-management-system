import { React, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
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

    useEffect(() => {
        axios.get(`${url}/settings/info`)
            .then((result) => {
                setInfo(result.data)
                setLoading(false)
            })
    }, [])

    return (
        <>
            <Navbar user={props.user} darkMode={props.darkMode} handleToggleTheme={props.handleToggleTheme} handleLogout={props.handleLogout} />
            {loading ? null :
                <>
                    <Box className={classes.wrapper}>
                        <Box sx={{ my: 3 }} className={classes.container}>
                            <Container>
                                <Grid container justifyContent="center" spacing={3}>
                                    <Grid item xs={10} sm={10} md={8} lg={8} xl={7}>
                                        <Typography variant="h6">Vision</Typography>
                                        <Typography variant="body1">
                                            UDMLibrary will be the most sophisticated eLibrary for
                                            any university in Mauritius.
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={10} sm={10} md={8} lg={8} xl={7}>
                                        <Typography variant="h6">Mission</Typography>
                                        <Typography variant="body1">
                                            To enhance the quality of life of any staff and students at UDM and give them a stress-free experience.
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={10} sm={7} md={5} lg={5} xl={6}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center">Information</TableCell>

                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <TableRow><TableCell>Temporary password will be valid for <span className={classes.bold}>{info.user.temp_password.value}</span> hrs</TableCell></TableRow>
                                                <TableRow><TableCell>Maximum number of reservation is <span className={classes.bold}>{info.book.number_of_reservations.value}</span></TableCell></TableRow>
                                                <TableRow><TableCell>Books will be on hold for <span className={classes.bold}>{info.book.time_onhold.value}</span> hrs before it goes to the next person</TableCell></TableRow>
                                                <TableRow><TableCell>Student can borrow <span className={classes.bold}>{info.user.student_borrow.value}</span> books at the same time</TableCell></TableRow>
                                                <TableRow><TableCell>Academic staff can borrow <span className={classes.bold}>{info.user.academic_borrow.value}</span> books at the same time</TableCell></TableRow>
                                                <TableRow><TableCell>Non-academic staff can borrow <span className={classes.bold}>{info.user.non_academic_borrow.value}</span> books per month</TableCell></TableRow>
                                                <TableRow><TableCell>Maximum number of renewals is <span className={classes.bold}>{info.book.renewals_allowed.value}</span></TableCell></TableRow>
                                                <TableRow><TableCell>High demand books will be issued <span className={classes.bold}>30</span> minutes before library is closed</TableCell></TableRow>
                                                <TableRow><TableCell>High demand books should be returned within <span className={classes.bold}>30</span> minutes after library is opened</TableCell></TableRow>
                                                <TableRow><TableCell>Fine per day is Rs  <span className={classes.bold}>{info.book.fine_per_day.value}</span></TableCell></TableRow>
                                            </TableBody>
                                        </Table>
                                    </Grid>
                                    <Grid item xs={10} sm={7} md={5} lg={4} xl={4}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center">Day</TableCell>
                                                    <TableCell align="center">Opening hours</TableCell>
                                                    <TableCell align="center">Closing hours</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {info.hours.map((day, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell align="center">{day.day}</TableCell>
                                                        <TableCell align="center">{new Date(day.open).getHours() === 0 ? <span className={classes.close}>Closed</span> : new Date(day.open).toLocaleTimeString()}</TableCell>
                                                        <TableCell align="center">{new Date(day.close).getHours() === 0 ? <span className={classes.close}>Closed</span> : new Date(day.close).toLocaleTimeString()}</TableCell>
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
    },
    bold: {
        fontWeight: 700
    }
}))

Info.propTypes = {
    user: PropTypes.object.isRequired,
    darkMode: PropTypes.bool.isRequired,
    handleToggleTheme: PropTypes.func.isRequired,
    handleLogout: PropTypes.func.isRequired
}

export default Info