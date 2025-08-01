const AsyncHandler = (asyncFunction) => {
    return (req, res, next) => {
        Promise.resolve(asyncFunction(req, res, next))
            .catch((error) => next(error));
    };
};
export { AsyncHandler };
