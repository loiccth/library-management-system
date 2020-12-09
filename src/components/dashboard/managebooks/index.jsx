import React from 'react'
import { useNavigate } from 'react-router-dom'
import AddBooks from './AddBooks'

const ManageBooks = ({ user }) => {
    const navigate = useNavigate()

    if (user.memberType !== 'Librarian') {
        navigate('/dashboard', { replace: true })
    }

    return (
        <div className="manage-books container">
            <AddBooks />
        </div>
    )
}

export default ManageBooks