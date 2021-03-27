import React from 'react'
import { useForm } from 'react-hook-form'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../settings/api'
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from '@material-ui/core'

const EditPost = (props) => {
    const { register, handleSubmit, errors, reset } = useForm({
        defaultValues: {
            title: props.post.title,
            body: props.post.body
        }
    })
    const { t } = useTranslation()

    const onSubmit = (data) => {
        axios.put(`${url}/posts/${props.post._id}`, data, { withCredentials: true })
            .then(result => {
                props.handleEdit(result.data)
            })
            .catch(err => {
                console.log(err)
                props.handleEdit(err.response.data)
            })
            .finally(() => {
                reset()
            })
    }

    return (
        <>
            <Dialog
                maxWidth="sm"
                fullWidth
                open={props.edit}
                onClose={props.handleEditToggle}
            >
                <DialogTitle>
                    {t('editPostTitle')}
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit(onSubmit)} id="add-post" noValidate>
                        <TextField
                            autoFocus
                            required
                            autoComplete="off"
                            id="title"
                            name="title"
                            label={t('title')}
                            fullWidth
                            variant="standard"
                            inputRef={register({ required: t('requiredField') })}
                            error={!!errors.title}
                            helperText={!!errors.title ? errors.title.message : " "}
                        />
                        <TextField
                            fullWidth
                            variant="standard"
                            margin="normal"
                            required
                            error={!!errors.body}
                            id="body"
                            name="body"
                            label={t('body')}
                            multiline
                            minRows={5}
                            inputRef={register({ required: t('requiredField') })}
                            helperText={!!errors.body ? errors.body.message : " "}
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={props.handleEditToggle} color="secondary">
                        {t('close')}
                    </Button>
                    <Button
                        autoFocus
                        variant="contained"
                        type="submit"
                        form="add-post"
                    >
                        {t('post')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

EditPost.propTypes = {
    post: PropTypes.object.isRequired,
    edit: PropTypes.bool.isRequired,
    handleEditToggle: PropTypes.func.isRequired,
    handleEdit: PropTypes.func.isRequired
}

export default EditPost