import React, { useState } from 'react'
import axios from 'axios'
import url from '../../../../settings/api'

const OverdueBooks = (props) => {
    const [msg, setMsg] = useState({
        message: ''
    })

    const handleOnClick = () => {
        axios.post(`${url}/users/notifyoverdue`, { overdueBooks: props.overdueBooks }, { withCredentials: true })
            .then(result => {
                if (result.data.error)
                    setMsg({
                        type: 'error',
                        message: result.data.error
                    })
                else
                    setMsg({
                        type: 'success',
                        message: `Notification successfully sent to ${result.data.listOfEmailSent.length} user(s).`
                    })
            })
    }

    return (
        <div className="overdue-books mb-5">
            <h3>List of overdue book(s)</h3>
            {msg.type === "error" ? <div className="alert alert-warning" role="alert">
                {msg.message}
            </div> : null}
            {msg.type === "success" ? <div className="alert alert-success" role="alert">
                {msg.message}
            </div> : null}
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">MemberID</th>
                        <th scope="col">Book</th>
                        <th scope="col">ISBN</th>
                        <th scope="col">Due Date</th>
                        <th scope="col">Renews</th>
                        <th scope="col">High Demand</th>
                        <th scope="col"><input type="checkbox" onChange={props.handleCheckAll} /></th>
                    </tr>
                </thead>
                <tbody>
                    {props.overdueBooks.length === 0 ? <span>No overdue books</span> : props.overdueBooks.map(borrow => {
                        return (
                            <tr key={borrow._id}>
                                <td>{borrow.userid}</td>
                                <td>{borrow.title}</td>
                                <td>{borrow.isbn}</td>
                                <td>{borrow.dueDate}</td>
                                <td>{borrow.renews}</td>
                                <td>{borrow.isHighDemand ? <span>HIGH DEMAND</span> : null}</td>
                                <td><input type="checkbox" value={borrow._id} checked={borrow.checked} onChange={props.handleCheck} /></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <button className="btn btn-secondary" onClick={handleOnClick}>Send notification</button>
        </div>
    )
}

export default OverdueBooks