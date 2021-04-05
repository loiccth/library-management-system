import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import url from '../../../settings/api'
import { Box, Divider, Grid, makeStyles } from '@material-ui/core'
import IssueBook from './IssueBook'
import ReturnBook from './ReturnBook'
import OverdueBooks from './OverdueBooks'
import DueBooks from './DueBooks'
import DuePayments from './DuePayments'
import Reservations from './Reservations'

const LibrarianMain = (props) => {
    const classes = useStyles()
    const [loading, setLoading] = useState(true)
    const [overdueBooks, setOverdueBooks] = useState([])
    const [dueBooks, setDueBooks] = useState([])
    const [duePayments, setDuePayments] = useState([])
    const [reservations, setReservations] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            const getOverdue = await axios.get(`${url}/books/overdue`, { withCredentials: true })
            setOverdueBooks(
                getOverdue.data.map(borrow => {
                    return {
                        checked: false,
                        _id: borrow._id,
                        userid: borrow.userid.userid,
                        email: borrow.userid.udmid.email,
                        phone: borrow.userid.udmid.phone,
                        title: borrow.bookid.title,
                        isbn: borrow.bookid.isbn,
                        dueDate: borrow.dueDate,
                        borrowDate: borrow.createdAt,
                        renews: borrow.renews,
                        isHighDemand: borrow.isHighDemand
                    }
                })
            )
            const getDue = await getDueBooks(new Date(), new Date())
            setDueBooks(
                getDue.data.map(borrow => {
                    return {
                        checked: false,
                        _id: borrow._id,
                        userid: borrow.userid.userid,
                        email: borrow.userid.udmid.email,
                        phone: borrow.userid.udmid.phone,
                        title: borrow.bookid.title,
                        isbn: borrow.bookid.isbn,
                        dueDate: borrow.dueDate,
                        borrowDate: borrow.createdAt,
                        renews: borrow.renews,
                        isHighDemand: borrow.isHighDemand
                    }
                })
            )
            const getReserve = await axios.get(`${url}/books/reservation`, { withCredentials: true })
            setReservations(
                getReserve.data.map(reserve => {
                    return {
                        _id: reserve._id,
                        userid: reserve.userid.userid,
                        title: reserve.bookid.title,
                        isbn: reserve.bookid.isbn,
                        reserveDate: reserve.createdAt,
                        expireDate: reserve.expireAt,
                        isHighDemand: reserve.bookid.isHighDemand
                    }
                })
            )
            const getDuePayments = await axios.get(`${url}/users/fine`, { withCredentials: true })
            setDuePayments(
                getDuePayments.data.map(payment => {
                    return {
                        _id: payment._id,
                        borrowDate: payment.borrowid.createdAt,
                        returnedDate: payment.borrowid.returnedOn,
                        dueDate: payment.borrowid.dueDate,
                        userid: payment.userid.userid,
                        memberType: payment.userid.memberType,
                        title: payment.bookid.title,
                        isbn: payment.bookid.isbn,
                        copyid: payment.copyid,
                        days: payment.numOfDays,
                        price: payment.pricePerDay,
                        date: payment.createdAt
                    }
                })
            )

            setLoading(false)
        }
        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getDueBooks = (from, to) => {
        return axios.post(`${url}/books/due`, { from, to }, { withCredentials: true })
    }

    const getNewDueBooks = async (date) => {
        if (date[0] instanceof Date && !isNaN(date[0].getTime()) && date[1] instanceof Date && !isNaN(date[1].getTime())) {
            const getDue = await getDueBooks(date[0], date[1])
            setDueBooks(
                getDue.data.map(borrow => {
                    return {
                        checked: false,
                        _id: borrow._id,
                        userid: borrow.userid.userid,
                        email: borrow.userid.udmid.email,
                        title: borrow.bookid.title,
                        isbn: borrow.bookid.isbn,
                        dueDate: borrow.dueDate,
                        borrowDate: borrow.createdAt,
                        renews: borrow.renews,
                        isHighDemand: borrow.isHighDemand
                    }
                })
            )
        }
    }

    const handleCheck = (e) => {
        setOverdueBooks(
            overdueBooks.map(borrow => {
                if (borrow._id === e.target.value) {
                    borrow.checked = e.target.checked
                }
                return borrow
            })
        )
    }

    const handleCheckAll = (e) => {
        setOverdueBooks(
            overdueBooks.map(borrow => {
                borrow.checked = e.target.checked
                return borrow
            })
        )
    }

    const handleUncheckAll = () => {
        setOverdueBooks(
            overdueBooks.map(borrow => {
                borrow.checked = false
                return borrow
            })
        )
    }

    const handleCheckDue = (e) => {
        setDueBooks(
            dueBooks.map(borrow => {
                if (borrow._id === e.target.value) {
                    borrow.checked = e.target.checked
                }
                return borrow
            })
        )
    }

    const handleCheckAllDue = (e) => {
        setDueBooks(
            dueBooks.map(borrow => {
                borrow.checked = e.target.checked
                return borrow
            })
        )
    }

    const handleUncheckAllDue = () => {
        setDueBooks(
            dueBooks.map(borrow => {
                borrow.checked = false
                return borrow
            })
        )
    }

    const handleFinePayment = (payment) => {
        setDuePayments(duePayments.filter(due => due._id !== payment._id))
    }

    const handleIssueBook = (id) => {
        setReservations(reservations.filter(reserve => reserve._id !== id))
    }

    const handleReturnBook = (id, dueCount) => {
        if (dueCount <= 0)
            setDueBooks(dueBooks.filter(book => book._id !== id))
        else
            setOverdueBooks(overdueBooks.filter(book => book._id !== id))
    }

    const handleNewPayment = (payment) => {
        setDuePayments([
            ...duePayments,
            {
                _id: payment._id,
                userid: payment.userid.userid,
                memberType: payment.userid.memberType,
                title: payment.bookid.title,
                isbn: payment.bookid.isbn,
                copyid: payment.copyid,
                days: payment.numOfDays,
                price: payment.pricePerDay,
                date: payment.createdAt
            }
        ])
    }

    return (
        <>
            {loading ? null :
                <Box sx={{ my: 5 }}>
                    <Grid container justifyContent="space-evenly">
                        <Grid item xs={5} sm={3} md={2} lg={2} xl={1} className={classes.button}>
                            <IssueBook handleIssueBook={handleIssueBook} />
                        </Grid>
                        <Grid item xs={5} sm={3} md={2} lg={2} xl={1} className={classes.button}>
                            <ReturnBook handleReturnBook={handleReturnBook} handleNewPayment={handleNewPayment} />
                        </Grid>
                    </Grid>
                    <Box sx={{ my: 3 }}>
                        <Divider />
                    </Box>
                    <OverdueBooks overdueBooks={overdueBooks} handleCheck={handleCheck} handleCheckAll={handleCheckAll} handleUncheckAll={handleUncheckAll} />
                    <Box sx={{ my: 3 }}>
                        <Divider />
                    </Box>
                    <DueBooks dueBooks={dueBooks} getNewDueBooks={getNewDueBooks} handleCheckDue={handleCheckDue} handleCheckAllDue={handleCheckAllDue} handleUncheckAllDue={handleUncheckAllDue} locale={props.locale} />
                    <Box sx={{ my: 3 }}>
                        <Divider />
                    </Box>
                    <DuePayments duePayments={duePayments} handleFinePayment={handleFinePayment} />
                    <Box sx={{ my: 3 }}>
                        <Divider />
                    </Box>
                    <Reservations reservations={reservations} />
                </Box>
            }
        </>
    )
}

const useStyles = makeStyles(() => ({
    button: {
        textAlign: 'center'
    }
}))

LibrarianMain.propTypes = {
    locale: PropTypes.string.isRequired
}

export default LibrarianMain