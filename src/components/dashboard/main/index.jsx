import React, { useState, useEffect } from 'react'
import axios from 'axios'
import url from '../../../settings/api'
import MyBooks from '../../dashboard/mybooks'
import AdminAnalytics from '../../dashboard/adminanalytics'
import OverdueBooks from './librarian/OverdueBooks'
import DueBooks from './librarian/DueBooks'
import Reservations from './librarian/Reservations'
import IssueBook from './librarian/IssueBook'
import ReturnBook from './librarian/ReturnBook'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Divider from '@material-ui/core/Divider'
import { makeStyles } from '@material-ui/core/styles'

const MainDashboard = ({ user }) => {
    const classes = useStyles()
    const [loading, setLoading] = useState(true)
    const [overdueBooks, setOverdueBooks] = useState()
    const [dueBooks, setDueBooks] = useState()
    const [reservations, setReservations] = useState()

    useEffect(() => {
        const getLibrarian = async () => {
            const getOverdue = await axios.get(`${url}/books/overdue`, { withCredentials: true })
            setOverdueBooks(
                getOverdue.data.map(borrow => {
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
            const getDue = await getDueBooks(new Date(), new Date())
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
            const getReserve = await axios.get(`${url}/books/reservation`, { withCredentials: true })
            setReservations(
                getReserve.data.map(reserve => {
                    return {
                        checked: false,
                        _id: reserve._id,
                        userid: reserve.userid.userid,
                        email: reserve.userid.udmid.email,
                        title: reserve.bookid.title,
                        isbn: reserve.bookid.isbn,
                        dueDate: reserve.dueDate,
                        reserveDate: reserve.createdAt,
                        expireDate: reserve.expireAt,
                        renews: reserve.renews,
                        isHighDemand: reserve.bookid.isHighDemand
                    }
                })
            )
            setLoading(false)
        }
        if (user.memberType === 'Librarian')
            getLibrarian()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ----------- Librarian -----------
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
    // ---------------------------------

    if (user.memberType === 'Member' || user.memberType === 'MemberA' || user.memberType === 'MemberNA') {
        return (
            <MyBooks />
        )
    }
    else if (user.memberType === 'Librarian') {
        return (
            <>
                {loading ? null :
                    <Box sx={{ my: 5 }}>
                        <Grid container justifyContent="space-evenly">
                            <Grid item xs={5} sm={3} md={2} lg={2} xl={1} className={classes.button}>
                                <IssueBook />
                            </Grid>
                            <Grid item xs={5} sm={3} md={2} lg={2} xl={1} className={classes.button}>
                                <ReturnBook />
                            </Grid>
                        </Grid>
                        <Box sx={{ my: 3 }}>
                            <Divider />
                        </Box>
                        <OverdueBooks overdueBooks={overdueBooks} handleCheck={handleCheck} handleCheckAll={handleCheckAll} handleUncheckAll={handleUncheckAll} />
                        <Box sx={{ my: 3 }}>
                            <Divider />
                        </Box>
                        <DueBooks dueBooks={dueBooks} getNewDueBooks={getNewDueBooks} handleCheckDue={handleCheckDue} handleCheckAllDue={handleCheckAllDue} handleUncheckAllDue={handleUncheckAllDue} />
                        <Box sx={{ my: 3 }}>
                            <Divider />
                        </Box>
                        <Reservations reservations={reservations} />
                    </Box>
                }
            </>
        )
    }
    else if (user.memberType === 'Admin') {
        return (
            <AdminAnalytics />
        )
    }
}

const useStyles = makeStyles(theme => ({
    button: {
        textAlign: 'center'
    }
}))

export default MainDashboard