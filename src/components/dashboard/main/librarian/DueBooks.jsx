import React from 'react'

const DueBooks = (props) => {
    return (
        <div className="due-books mb-5">
            <h3>List of book(s) due today</h3>
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">MemberID</th>
                        <th scope="col">Book</th>
                        <th scope="col">ISBN</th>
                        <th scope="col">Due Date</th>
                        <th scope="col">Renews</th>
                        <th scope="col">High Demand</th>
                        <th scope="col"><input type="checkbox" /></th>
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

export default DueBooks