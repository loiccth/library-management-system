import axios from 'axios'
import url from '../settings/api'
import { v4 as uuidv4 } from 'uuid'
import { deviceDetect, deviceType } from 'react-device-detect'

export const analytics = (type, info) => {
    if (!sessionStorage.getItem('session_id')) {
        sessionStorage.setItem('session_id', uuidv4())
    }

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

    axios.post(`${url}/analytics`, data, { withCredentials: true })
}