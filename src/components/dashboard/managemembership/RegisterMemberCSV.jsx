import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { DropzoneArea } from 'material-ui-dropzone'
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

const RegisterMemberCSV = () => {
    const classes = useStyles()
    const [open, setOpen] = useState(false)
    const [result, setResult] = useState({
        success: [],
        fail: []
    })
    const { handleSubmit, errors, reset, control } = useForm()

    const handleClick = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        setResult({
            success: [],
            fail: []
        })
    }

    const onSubmit = (data) => {
        const dataForm = new FormData()
        dataForm.append('csv', data.csv[0])
        axios.post(`${url}/users/register_csv`, dataForm, { withCredentials: true })
            .then(result => {
                setResult(result.data)
                handleClick()
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
                                        dropzoneText="Drag and drop a CSV file here or browse"
                                        showPreviews={true}
                                        showPreviewsInDropzone={false}
                                        useChipsForPreview
                                        previewGridProps={{ container: { spacing: 1, direction: 'row' } }}
                                        previewChipProps={{ classes: { root: classes.previewChip } }}
                                        previewText="Selected CSV file"
                                        maxFileSize={10485760}
                                    />}
                                    name="csv"
                                    control={control}
                                    rules={{ validate: value => value.length > 0 }}
                                    defaultValue={[]}
                                />
                                <FormHelperText error children={!!errors.csv ? "CSV file required." : ""} />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                >Register members</Button>
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

export default RegisterMemberCSV