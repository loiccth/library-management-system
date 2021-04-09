import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    useTheme
} from '@material-ui/core'

// Popup window when using csv files
// This will display the result of the csv file
// the number of success and failed attempt
const PopUpWindow = (props) => {
    const { t } = useTranslation()
    const theme = useTheme()

    return (
        <>
            <Dialog open={props.open} onClose={props.handleClose} aria-labelledby="form-dialog-title" maxWidth="sm" fullWidth style={{ direction: theme.direction }}>
                <DialogTitle id="form-dialog-title">{t('csvMenuTitle')}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body1">{t('success')}</Typography>
                        {props.result.success.length > 0 ?
                            props.result.success.map((result, index) => (
                                <Typography key={index} variant="body2">{result}</Typography>
                            ))
                            :
                            <Typography variant="body2">{t('noSuccess')}</Typography>
                        }
                    </Box>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body1">{t('fail')}</Typography>
                        {props.result.fail.length > 0 ?
                            props.result.fail.map((result, index) => (
                                <Typography key={index} variant="body2">{result}</Typography>
                            ))
                            :
                            <Typography variant="body2">{t('noFail')}</Typography>
                        }
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="secondary" onClick={props.handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

PopUpWindow.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    result: PropTypes.object.isRequired
}

export default PopUpWindow