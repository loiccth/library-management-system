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
    Link,
    TextField,
    useTheme
} from '@material-ui/core'

const EditPost = (props) => {
    // Set default values in form from the post title and body
    const { register, handleSubmit, errors } = useForm({
        defaultValues: {
            title: props.post.title,
            body: props.post.body
        },
        shouldUnregister: false
    })
    const { t } = useTranslation()
    const theme = useTheme()

    // Submit form call api to update post
    const onSubmit = (data) => {
        axios.put(`${url}/posts/${props.post._id}`, data, { withCredentials: true })
            .then(result => {
                props.handleEdit(result.data)
            })
            .catch(err => {
                props.handleEdit(err.response.data)
            })
    }

    return (
        <>
            <Dialog
                maxWidth="sm"
                fullWidth
                open={props.edit}
                onClose={props.handleEditToggle}
                style={{ direction: theme.direction }}
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
                            helperText={!!errors.body ? errors.body.message : <>{t('use')} <Link href="https://www.markdownguide.org/cheat-sheet/" target="_blank">Markdown</Link> {t('markdown')}</>}
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={props.handleEditToggle} color="secondary">
                        {t('close')}
                    </Button>
                    <Button
                        variant="contained"
                        type="submit"
                        form="add-post"
                    >
                        {t('update')}
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
    handleEdit: PropTypes.func.isRequired,
}

export default EditPost