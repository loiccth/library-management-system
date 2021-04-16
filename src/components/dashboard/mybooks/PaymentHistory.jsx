import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
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
    Typography
} from '@material-ui/core'

const PaymentHistory = () => {
    const classes = useStyles()
    const [payments, setPayments] = useState([])
    const { t } = useTranslation()
    const [page, setPage] = useState(1)
    const rowPerPage = 5

    // Get list of payments made on page load
    useEffect(() => {
        const fetchData = async () => {
            const temp = await axios.get(`${url}/users/payments_history`, { withCredentials: true })
            setPayments(temp.data)
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
                    <Typography variant="h6">{t('paymentHistory')}</Typography>
                </Toolbar>
            </Container>
            <Box sx={{ mt: 3 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={12} md={11} lg={10}>
                        <Paper className={classes.paper}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell width={'28%'}>{t('paymentDetails')}</TableCell>
                                        <TableCell width={'28%'}>{t('bookDetails')}</TableCell>
                                        <TableCell width={'28%'}>{t('borrowDetails')}</TableCell>
                                        <TableCell width={'16%'}>{t('amount')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {payments.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">{t('noRecords')}</TableCell>
                                        </TableRow>
                                    }
                                    {payments.slice((page - 1) * rowPerPage, (page - 1) * rowPerPage + rowPerPage).map(row => (
                                        <TableRow key={row._id}>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('id')}: {row._id}</Typography>
                                                <Typography variant="caption" display="block">{t('paid')}: {row.paid === true ? 'Yes' : <span style={{ color: '#ff0000', fontWeight: 800 }}>No</span>}</Typography>
                                                <Typography variant="caption" display="block">{t('date')}: {new Date(row.createdAt).toLocaleString()}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('title')}: {row.bookid.title}</Typography>
                                                <Typography variant="caption" display="block">{t('isbn')}: {row.bookid.isbn}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('borrowDate')}: {new Date(row.borrowid.createdAt).toLocaleString()}</Typography>
                                                <Typography variant="caption" display="block">{t('dueDate')}: {new Date(row.borrowid.dueDate).toLocaleString()}</Typography>
                                                <Typography variant="caption" display="block">{t('returnDate')}: {new Date(row.borrowid.returnedOn).toLocaleString()}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('pricePerDay')}: Rs {row.pricePerDay}</Typography>
                                                <Typography variant="caption" display="block">{t('daysOverdue')}: {row.numOfDays}</Typography>
                                                <Typography variant="caption" display="block">{t('total')}: Rs {row.pricePerDay * row.numOfDays}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <Grid container justifyContent="center">
                                                <Grid item xs={12}>
                                                    <Pagination
                                                        className={classes.pagination}
                                                        count={Math.ceil(payments.length / rowPerPage)}
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
    table: {
        minWidth: 850
    },
    title: {
        flex: 1
    },
    paper: {
        overflowX: 'auto'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center'
    }
}))

export default PaymentHistory