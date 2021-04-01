import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
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
} from '@material-ui/core'

const LatestLogins = (props) => {
    const classes = useStyles()
    const { t } = useTranslation()

    return (
        <>
            <Container>
                <Toolbar>
                    <Typography variant="h6">{t('latestLogin')}</Typography>
                </Toolbar>
            </Container>
            <Box sx={{ mt: 3 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={11} md={10}>
                        <Paper className={classes.paper}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('memberDetails')}</TableCell>
                                        <TableCell>{t('geolocation')}</TableCell>
                                        <TableCell>{t('deviceDetails')}</TableCell>
                                        <TableCell>{t('time')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.latest.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">{t('noRecords')}</TableCell>
                                        </TableRow>
                                    }
                                    {props.latest.map(row => (
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
        minWidth: 650,
        overflowX: 'auto'
    },
    heading: {
        justifyContent: 'flex-end',
        [theme.breakpoints.down("sm")]: {
            justifyContent: 'center'
        }
    },
    highpriority: {
        color: 'red'
    }
}))

LatestLogins.propTypes = {
    latest: PropTypes.array.isRequired
}

export default LatestLogins