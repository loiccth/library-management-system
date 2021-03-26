export const getLocale = () => {
    const temp = localStorage.getItem('i18nextLng')
    let locale = ''

    if (!temp)
        locale = 'enUS'
    else {
        if (temp === 'en')
            locale = 'enUS'
        else if (temp === 'fr')
            locale = 'frFR'
        else if (temp === 'zh')
            locale = 'zhCN'
    }

    return locale
}