import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import {
    Button,
    Box,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
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
    useTheme
} from '@material-ui/core'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'

const ReservedBooks = (props) => {
    const classes = useStyles()
    const [open, setOpen] = useState(false)
    const { t } = useTranslation()
    const theme = useTheme()

    const handleToggle = () => {
        setOpen(!open)
    }

    const handleCancel = (id) => {
        setOpen(false)
        props.handleCancel(id)
    }

    return (
        <>
            <Container>
                <Toolbar>
                    <Typography variant="h6">{t('reservation')}</Typography>
                </Toolbar>
            </Container>
            <Box sx={{ mt: 3 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={12} md={10}>
                        <Paper className={classes.paper}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('reservations')}</TableCell>
                                        <TableCell>{t('bookDetails')}</TableCell>
                                        <TableCell>{t('availability')}</TableCell>
                                        <TableCell>Flags</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.reserved.booksReserved.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">{t('noRecords')}</TableCell>
                                        </TableRow>
                                    }
                                    {props.reserved.booksReserved.map((row, index) => (
                                        <TableRow key={row._id}>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('reservedDate')}: {new Date(row.createdAt).toLocaleString()}</Typography>
                                                <Typography variant="caption" display="block">{t('expireDate')}: {row.expireAt ? new Date(row.expireAt).toLocaleString() : 'TBD'}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('title')}: {row.bookid.title}</Typography>
                                                <Typography variant="caption" display="block">{t('isbn')}: {row.bookid.isbn}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('total')}: {row.bookid.copies.length}</Typography>
                                                <Typography variant="caption" display="block">{t('onloan')}: {row.bookid.noOfBooksOnLoan}</Typography>
                                                <Typography variant="caption" display="block">{t('hold')}: {row.bookid.noOfBooksOnHold}</Typography>
                                                <Typography variant="caption" display="block">{t('reservation')}: {row.bookid.reservation.length}</Typography>
                                                <Typography variant="caption" display="block">{t('queuePosition')}: {props.reserved.position[index]}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {row.bookid.isHighDemand &&
                                                    <Tooltip title={t('highDemand')} arrow>
                                                        <PriorityHighIcon className={classes.highpriority} />
                                                    </Tooltip>
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="contained" onClick={handleToggle} >{t('cancel')}</Button>
                                                <Dialog
                                                    open={open}
                                                    onClose={handleToggle}
                                                    aria-labelledby="alert-dialog-title"
                                                    aria-describedby="alert-dialog-description"
                                                    style={{ direction: theme.direction }}
                                                >
                                                    <DialogContent>
                                                        <DialogContentText id="alert-dialog-description">
                                                            {t('cancelMsg') + ` ${row.bookid.title}?`}
                                                        </DialogContentText>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <Button onClick={handleToggle} variant="contained" color="secondary">
                                                            {t('cancel')}
                                                        </Button>
                                                        <Button onClick={() => handleCancel(row.bookid._id)} variant="contained" autoFocus>
                                                            {t('confirm')}
                                                        </Button>
                                                    </DialogActions>
                                                </Dialog>
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
    table: {
        minWidth: 650,
        overflowX: 'auto'
    },
    title: {
        flex: 1
    },
    paper: {
        overflowX: 'auto'
    },
    highpriority: {
        color: 'red'
    }
}))

ReservedBooks.propTypes = {
    reserved: PropTypes.object.isRequired,
    handleCancel: PropTypes.func.isRequired
}

export default ReservedBooks