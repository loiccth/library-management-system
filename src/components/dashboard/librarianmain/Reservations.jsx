import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import {
    Box,
    Container,
    Grid,
    makeStyles,
    Pagination,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Toolbar,
    Tooltip,
    Typography,
} from '@material-ui/core'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'

const Reservations = (props) => {
    const classes = useStyles()
    const { t } = useTranslation()
    const [page, setPage] = useState(1)
    const rowPerPage = 5

    const handlePagination = (e, value) => {
        setPage(value)
    }

    return (
        <>
            <Container>
                <Toolbar>
                    <Typography variant="h6">{t('bookReservations')}</Typography>
                </Toolbar>
            </Container>
            <Box sx={{ mt: 3 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={12} md={10}>
                        <Paper className={classes.paper}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>MemberID</TableCell>
                                        <TableCell>{t('bookDetails')}</TableCell>
                                        <TableCell>{t('reservations')}</TableCell>
                                        <TableCell>Flags</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.reservations.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">{t('noRecords')}</TableCell>
                                        </TableRow>
                                    }
                                    {props.reservations.slice((page - 1) * rowPerPage, (page - 1) * rowPerPage + rowPerPage).map(row => (
                                        <TableRow key={row._id}>
                                            <TableCell component="th" scope="row">
                                                {row.userid}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('title')}: {row.title}</Typography>
                                                <Typography variant="caption" display="block">ISBN: {row.isbn}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('reserve')}: {new Date(row.reserveDate).toLocaleString()}</Typography>
                                                <Typography variant="caption" display="block">{t('expire')}: {new Date(row.expireDate).toLocaleString()}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {row.isHighDemand &&
                                                    <Tooltip title={t('highDemand')} arrow>
                                                        <PriorityHighIcon className={classes.highpriority} />
                                                    </Tooltip>
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <Grid container justifyContent="center">
                                                <Grid item xs={12}>
                                                    <Pagination
                                                        className={classes.pagination}
                                                        count={Math.ceil(props.reservations.length / rowPerPage)}
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

const useStyles = makeStyles(() => ({
    paper: {
        overflowX: 'auto'
    },
    table: {
        minWidth: 650,
        overflowX: 'auto'
    },
    highpriority: {
        color: 'red'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center'
    }
}))

Reservations.propTypes = {
    reservations: PropTypes.array.isRequired
}

export default Reservations