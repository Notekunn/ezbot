export const formatString = (message: string, values?: Object): string => {
  if (!message) return '';
  if (!values) return message;

  return message.replace(/\{(\w+)\}/g, function (txt, key) {
    if (values.hasOwnProperty(key)) {
      return values[key];
    }
    return txt;
  });
};
