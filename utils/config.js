const returnRes = (res, status, message, data = {}) => {
  return res
    .status(status)
    .json({ status: status, data: data, message: message });
};

module.exports = returnRes;
