const getParam = (paramsArr, keyText) => {
  const p = paramsArr.find(
    p => p.ParameterText.toLowerCase() === keyText.toLowerCase(),
  );
  return p ? p.ValueText : null;
};


const parseTemperatureRange = (paramsArr, keyText) => {
  const raw = getParam(paramsArr, keyText);
  if (!raw) return { min: null, max: null };

  const match = raw.match(/(-?\d+)\s*°C\s*~\s*(-?\d+)\s*°C/);
  if (!match) return { min: null, max: null };

  return {
    min: parseInt(match[1], 10),
    max: parseInt(match[2], 10)
  };
};

module.exports = {
  getParam,
  parseTemperatureRange
};