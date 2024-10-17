export const TryCatch= (fn) => {
    return (req, res, next) => {
        return fn(req, res, next).catch(next);
    };
}