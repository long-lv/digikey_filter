const getParam = (paramsArr, keyText) => {
  const p = paramsArr.find(
    p => p.ParameterText.toLowerCase() === keyText.toLowerCase(),
  );
  return p ? p.ValueText : null;
};

module.exports = {
  getParam,
};