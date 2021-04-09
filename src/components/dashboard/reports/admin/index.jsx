import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import url from '../../../../settings/api'
import { Box, Divider } from '@material-ui/core'
import AnalyticsReport from './AnalyticsReport'
import MembersReport from './MembersReport'

const AdminReports = ({ locale }) => {
    const [loading, setLoading] = useState(true)
    const [members, setMembers] = useState()
    const [filteredMembers, setFilteredMembers] = useState()
    const [filterMembers, setFilterMembers] = useState({
        status: 'All'
    })
    const [analytics, setAnalytics] = useState([])
    const [csv, setCsv] = useState([])
    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

    useEffect(() => {
        const fetchData = async () => {
            const getMembers = await getMembersReport(firstDay, new Date())
            setMembers(getMembers)
            setFilteredMembers(getMembers)

            getAnalyticsReport(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), new Date())

            setLoading(false)
        }
        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Set filter type for member report
    const handleMembersChange = (e) => {
        setFilterMembers({
            [e.target.name]: e.target.value
        })
        handleFilterMembers(e.target.value)
    }

    // Filter members
    const handleFilterMembers = (value) => {
        if (value === 'All')
            setFilteredMembers([...members])
        else
            setFilteredMembers(members.filter(record => record.Status === value))
    }

    // Get new data when date range is updated
    const getNewMembersReport = async (date) => {
        if (date[0] instanceof Date && !isNaN(date[0].getTime()) && date[1] instanceof Date && !isNaN(date[1].getTime())) {
            const getMembers = await getMembersReport(date[0], date[1])
            setMembers(getMembers)

            if (filterMembers.status !== 'All')
                handleFilterMembers(filterMembers.status)
            else
                setFilteredMembers(getMembers)
        }
    }

    // Function to get data
    const getMembersReport = async (from, to) => {
        const getMembers = await axios.post(`${url}/users/membersreport`, { from, to }, { withCredentials: true })

        const temp = getMembers.data.map(member => {
            return {
                RegistrationID: member._id,
                Date: member.createdAt,
                Status: member.status,
                MemberID: member.userid,
                MemberType: member.memberType,
                FirstName: member.udmid.firstName,
                LastName: member.udmid.lastName,
                Email: member.udmid.email,
                Phone: member.udmid.phone,
                udmType: member.udmid.udmType,
                staffType: member.udmid.udmType === 'Staff' ? member.udmid.staffType : null,
                studentType: member.udmid.udmType === 'Student' ? member.udmid.studentType : null,
                academic: member.udmid.academic === true ? 'Yes' : 'No',
                faculty: member.udmid.faculty,
                contractEndDate: (member.udmid.udmType === 'Staff' && member.udmid.staffType === 'pt') ? member.udmid.contractEndDate : null
            }
        })
        return temp
    }

    // Get analytics report within range
    const getAnalyticsReport = (from, to) => {
        axios.post(`${url}/analytics/report`, { from, to }, { withCredentials: true })
            .then(result => {
                setAnalytics(result.data.analytics)
                setCsv(result.data.csv)
            })
    }

    // Get new data for analytics when date range is updated
    const getNewAnalyticsReport = (date) => {
        if (date[0] instanceof Date && !isNaN(date[0].getTime()) && date[1] instanceof Date && !isNaN(date[1].getTime())) {
            getAnalyticsReport(date[0], date[1])
        }
    }

    return (
        <>
            {loading ? null :
                <Box sx={{ my: 5 }}>
                    <AnalyticsReport
                        analytics={analytics}
                        getNewAnalyticsReport={getNewAnalyticsReport}
                        csv={csv}
                        locale={locale}
                    />
                    <Box sx={{ my: 3 }}>
                        <Divider />
                    </Box>
                    <MembersReport
                        filteredMembers={filteredMembers}
                        getNewMembersReport={getNewMembersReport}
                        handleMembersChange={handleMembersChange}
                        filterMembers={filterMembers}
                        locale={locale}
                    />
                </Box>
            }
        </>
    )
}

AdminReports.propTypes = {
    locale: PropTypes.string.isRequired
}

export default AdminReports