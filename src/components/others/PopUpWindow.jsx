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
    Typography
} from '@material-ui/core'

const PopUpWindow = (props) => {
    const { t } = useTranslation()

    return (
        <>
            <Dialog open={props.open} onClose={props.handleClose} aria-labelledby="form-dialog-title" maxWidth="sm" fullWidth>
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