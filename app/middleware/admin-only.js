/**
 * admin-only
 * api.get-native.com
 *
 * Created by henryehly on 2017/05/29.
 */

const GetNativeError = require('../services')['GetNativeError'];
const k = require('../../config/keys.json');

module.exports = async (req, res, next) => {
    if (await req.user.isAdmin()) {
        next();
    } else {
        next(new GetNativeError(k.Error.ResourceNotFound));
    }
};
