const prod = 'https://api.udmlibrary.com'

const dev = 'http://localhost:5000'

export default process.env.NODE_ENV === 'development' ? dev : prod