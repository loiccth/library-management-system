import React from 'react'

const Reservations = (props) => {
    return (
        <div className="reservation-today">
            <h3>List of reservation for today</h3>
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">MemberID</th>
                        <th scope="col">Book</th>
                        <th scope="col">ISBN</th>
                        <th scope="col">Expire At</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
            <button className="btn btn-secondary">Send notification</button>
            {/* {dueBooks.length === 0 ? <span>No due books</span> : dueBooks.map(test => {
                return (
                    <p key={test._id}>{test.userid.userid}</p>
                )
            })} */}
        </div>
    )
}

export default Reservations