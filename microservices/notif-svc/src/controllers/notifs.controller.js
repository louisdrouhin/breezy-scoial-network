export default (req, res, next) => {
    const username = req.get('x-user-username');
    const role = req.get('x-user-role');

    if (username) {
        return res.status(400).json()
    }
    next();

};
