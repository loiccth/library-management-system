import React, { useState, useEffect } from 'react'
import axios from 'axios'
import url from '../../../settings/api'
import OverdueBooks from './librarian/OverdueBooks'
import DueBooks from './librarian/DueBooks'
import Reservations from './librarian/Reservations'

const MainDashboard = ({ user }) => {
    const [loading, setLoading] = useState(true)
    const [overdueBooks, setOverdueBooks] = useState([])
    const [dueBooks, setDueBooks] = useState([])

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
                        renews: borrow.renews,
                        isHighDemand: borrow.isHighDemand
                    }
                })
            )
            const getDue = await axios.get(`${url}/books/due`, { withCredentials: true })
            setDueBooks(getDue.data)
            setLoading(false)
        }
        if (user.memberType === 'Librarian')
            getLibrarian()

    }, [user])

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

    if (user.memberType === 'Member' || user.memberType === 'MemberA' || user.memberType === 'MemberNA') {
        return (
            <div className="container">
                hellow rold
            </div>
        )
    }
    else if (user.memberType === 'Librarian') {
        return (
            <div className="container">
                {loading ? null :
                    <React.Fragment>
                        <OverdueBooks overdueBooks={overdueBooks} handleCheck={handleCheck} handleCheckAll={handleCheckAll} />
                        <DueBooks dueBooks={dueBooks} />
                        <Reservations />
                    </React.Fragment>
                }
            </div>
        )
    }
    else if (user.memberType === 'Admin') {
        return (
            <div className="container">
                admin dashboard
            </div>
        )
    }
}

export default MainDashboard