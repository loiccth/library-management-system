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

            const getAnalytics = await getAnalyticsReport(firstDay, new Date())
            setAnalytics(getAnalytics)

            setLoading(false)
        }
        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleMembersChange = (e) => {
        setFilterMembers({
            [e.target.name]: e.target.value
        })
        handleFilterMembers(e.target.value)
    }

    const handleFilterMembers = (value) => {
        if (value === 'All')
            setFilteredMembers([...members])
        else
            setFilteredMembers(members.filter(record => record.Status === value))
    }

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

    const getAnalyticsReport = async (from, to) => {
        const getAnalytics = await axios.post(`${url}/analytics/report`, { from, to }, { withCredentials: true })
        const temp = getAnalytics.data.map(record => {
            let temp2 = []

            for (let i = 0; i < record.events.length; i++) {
                temp2.push({
                    type: record.events[i].event.type,
                    info: record.events[i].event.info,
                    date: record.events[i].date
                })
            }

            return {
                sessionid: record._id.sessionid,
                sessionDate: record._id.sessionDate,
                user: record._id.userid,
                ip: record._id.ip,
                geolocation: record.geolocation,
                device: record._id.device,
                userAgent: record._id.userAgent,
                events: temp2
            }
        })

        return temp
    }

    const getNewAnalyticsReport = async (date) => {
        if (date[0] instanceof Date && !isNaN(date[0].getTime()) && date[1] instanceof Date && !isNaN(date[1].getTime())) {
            const getAnalytics = await getAnalyticsReport(date[0], date[1])
            setAnalytics(getAnalytics)
        }
    }

    useEffect(() => {
        let temp = []

        if (analytics.length > 0) {
            for (let i = 0; i < analytics.length; i++) {
                for (let j = 0; j < analytics[i].events.length; j++) {
                    temp.push({
                        user: j === 0 ? analytics[i].user === null ? 'Guest' : analytics[i].user.userid : null,
                        sessionid: j === 0 ? analytics[i].sessionid : null,
                        sessionDate: j === 0 ? analytics[i].sessionDate : null,
                        ip: j === 0 ? analytics[i].ip : null,
                        geolocation: j === 0 ? analytics[i].geolocation.regionName + ', ' + analytics[i].geolocation.countryName + ', ' + analytics[i].geolocation.continentName : null,
                        device: j === 0 ? analytics[i].device : null,
                        userAgent: j === 0 ? analytics[i].userAgent : null,
                        eventTime: analytics[i].events[j].date,
                        events: analytics[i].events[j].type + ' - ' + analytics[i].events[j].info
                    })
                }
            }
        }

        setCsv(temp)
    }, [analytics])

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