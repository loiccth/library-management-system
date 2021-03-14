import React from 'react'
import PropTypes from 'prop-types'
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
    Tooltip,
    Typography,
} from '@material-ui/core'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'

const Reservations = (props) => {
    const classes = useStyles()

    return (
        <>
            <Container>
                <Toolbar>
                    <Typography variant="h6">Book Reservations</Typography>
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
                                        <TableCell>Book Details</TableCell>
                                        <TableCell>Reservation Details</TableCell>
                                        <TableCell>Flags</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.reservations.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">No records found.</TableCell>
                                        </TableRow>
                                    }
                                    {props.reservations.map(row => (
                                        <TableRow key={row._id}>
                                            <TableCell component="th" scope="row">
                                                {row.userid}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">Title: {row.title}</Typography>
                                                <Typography variant="caption" display="block">ISBN: {row.isbn}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">Reserve: {new Date(row.reserveDate).toLocaleString()}</Typography>
                                                <Typography variant="caption" display="block">Expire: {new Date(row.expireDate).toLocaleString()}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {row.isHighDemand &&
                                                    <Tooltip title="High Demand" arrow>
                                                        <PriorityHighIcon />
                                                    </Tooltip>
                                                }
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

const useStyles = makeStyles(() => ({
    paper: {
        overflowX: 'auto'
    },
    table: {
        minWidth: 650,
        overflowX: 'auto'
    }
}))

Reservations.propTypes = {
    reservations: PropTypes.array.isRequired
}

export default Reservations