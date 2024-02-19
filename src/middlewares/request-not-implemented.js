module.exports = () => (_, res) => {
  res.aydinnRes.send
    .context({ message: "Request method or URL implementation" })
    .doesNotExist();
};
