import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { DropzoneArea } from 'material-ui-dropzone'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Box,
    Button,
    FormHelperText,
    Grid,
    makeStyles,
    Paper
} from '@material-ui/core'
import PopUpWindow from '../../others/PopUpWindow'

const AddBookCSV = () => {
    const classes = useStyles()
    const [open, setOpen] = useState(false)
    const [result, setResult] = useState({
        success: [],
        fail: []
    })
    const [disable, setDisable] = useState(false)
    const { handleSubmit, errors, reset, control } = useForm()
    const { t } = useTranslation()

    // Open window to display result
    const handleClick = () => {
        setOpen(true)
    }

    // Close window
    const handleClose = () => {
        setOpen(false)
        setResult({
            success: [],
            fail: []
        })
    }

    // Send csv file to the server
    const onSubmit = (data) => {
        setDisable(true)
        const dataForm = new FormData()
        dataForm.append('csv', data.csv[0])
        axios.post(`${url}/books/add`, dataForm, { withCredentials: true })
            .then(result => {
                setResult(result.data)
                handleClick()
                setDisable(false)
            })
        reset()
    }

    return (
        <>
            <Box sx={{ mt: 3 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={10} md={10}>
                        <Paper className={classes.paper}>
                            <form noValidate onSubmit={handleSubmit(onSubmit)}>
                                <Controller
                                    as={<DropzoneArea
                                        acceptedFiles={[".csv, text/csv, application/vnd.ms-excel, application/csv, text/x-csv, application/x-csv, text/comma-separated-values, text/x-comma-separated-values"]}
                                        filesLimit={1}
                                        dropzoneText={t('dropzoneText')}
                                        showPreviews={true}
                                        showPreviewsInDropzone={false}
                                        useChipsForPreview
                                        previewGridProps={{ container: { spacing: 1, direction: 'row' } }}
                                        previewChipProps={{ classes: { root: classes.previewChip } }}
                                        previewText={t('dropzonePreview')}
                                        maxFileSize={10485760}
                                    />}
                                    name="csv"
                                    control={control}
                                    rules={{ validate: value => value.length > 0 }}
                                    defaultValue={[]}
                                />
                                <FormHelperText error children={!!errors.csv ? t('csvValidation') : " "} />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={disable}
                                    fullWidth
                                >{t('addBooks')}</Button>
                            </form>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
            <PopUpWindow open={open} handleClose={handleClose} result={result} />
        </>
    )
}

const useStyles = makeStyles(() => ({
    paper: {
        padding: 10
    },
    previewChip: {
        minWidth: 160,
        maxWidth: 210
    }
}))

export default AddBookCSV