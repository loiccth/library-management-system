import axios from 'axios'
import url from '../settings/api'
import { v4 as uuidv4 } from 'uuid'
import { deviceDetect, deviceType } from 'react-device-detect'

// Function to send analytic data to the server and process
export const analytics = (type, info) => {
    if (!sessionStorage.getItem('session_id')) {
        sessionStorage.setItem('session_id', uuidv4())
    }

    // Get user agent and device type of the client
    const { userAgent, ua } = deviceDetect()

    const data = {
        sessionid: sessionStorage.getItem('session_id'),
        device: deviceType,
        userAgent: userAgent === undefined ? ua : userAgent,
        event: {
            type,
            info
        }
    }

    // Send data
    axios.post(`${url}/analytics`, data, { withCredentials: true })
}