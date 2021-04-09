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
    Pagination,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Toolbar,
    Typography,
    useTheme
} from '@material-ui/core'

const RequestedBooks = (props) => {
    const classes = useStyles()
    const { t } = useTranslation()
    const [page, setPage] = useState(1)
    const [open, setOpen] = useState(false)
    const theme = useTheme()
    const rowPerPage = 5

    // Change page
    const handlePagination = (e, value) => {
        setPage(value)
    }

    // Open/close window pop up
    const handleToggle = () => {
        setOpen(!open)
    }

    return (
        <>
            <Container>
                <Toolbar>
                    <Typography variant="h6">{t('requestedBooks')}</Typography>
                </Toolbar>
            </Container>
            <Box sx={{ mt: 3 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={12} md={10}>
                        <Paper className={classes.paper}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('memberDetails')}</TableCell>
                                        <TableCell>{t('bookDetails')}</TableCell>
                                        <TableCell>{t('publishDetails')}</TableCell>
                                        <TableCell>{t('date')}</TableCell>
                                        <TableCell />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.books.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">{t('noRecords')}</TableCell>
                                        </TableRow>
                                    }
                                    {props.books.slice((page - 1) * rowPerPage, (page - 1) * rowPerPage + rowPerPage).map(row => (
                                        <TableRow key={row._id}>
                                            <TableCell component="th" scope="row">
                                                <Typography variant="caption" display="block">{t('memberid')}: {row.userid.userid}</Typography>
                                                <Typography variant="caption" display="block">{t('faculty')}: {row.userid.udmid.faculty}</Typography>
                                                <Typography variant="caption" display="block">{t('firstName')}: {row.userid.udmid.firstName}</Typography>
                                                <Typography variant="caption" display="block">{t('lastName')}: {row.userid.udmid.lastName}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('title')}: {row.title}</Typography>
                                                <Typography variant="caption" display="block">{t('isbn')}: {row.isbn}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('publisher')}: {row.publisher}</Typography>
                                                <Typography variant="caption" display="block">{t('publishedDate')}: {new Date(row.publishedDate).toLocaleDateString()}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('requestedDate')}: {new Date(row.createdAt).toLocaleString()}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="contained" onClick={handleToggle}>{t('remove')}</Button>
                                                <Dialog
                                                    open={open}
                                                    onClose={handleToggle}
                                                    aria-labelledby="alert-dialog-title"
                                                    aria-describedby="alert-dialog-description"
                                                    style={{ direction: theme.direction }}
                                                >
                                                    <DialogContent>
                                                        <DialogContentText id="alert-dialog-description">
                                                            {t('removeRequestedBookDialog')}
                                                        </DialogContentText>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <Button variant="contained" onClick={handleToggle} color="secondary">
                                                            {t('cancel')}
                                                        </Button>
                                                        <Button variant="contained" onClick={() => {
                                                            setOpen(false)
                                                            props.handleRemove(row._id)
                                                        }}
                                                            autoFocus
                                                        >
                                                            {t('confirm')}
                                                        </Button>
                                                    </DialogActions>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Grid container justifyContent="center">
                                                <Grid item xs={12}>
                                                    <Pagination
                                                        className={classes.pagination}
                                                        count={Math.ceil(props.books.length / rowPerPage)}
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
    pagination: {
        display: 'flex',
        justifyContent: 'center'
    }
}))

RequestedBooks.propTypes = {
    books: PropTypes.array.isRequired,
    handleRemove: PropTypes.func.isRequired
}

export default RequestedBooks