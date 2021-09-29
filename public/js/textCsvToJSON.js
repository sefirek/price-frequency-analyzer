/**
 * @param {string} textCsv plik csv w formacie tekstowym
 */
export default function textCsvToJSON(textCsv) {
  const textRecords = textCsv.split('\r\n');
  const array = [];
  textRecords.forEach((textRecord) => {
    const params = textRecord.split(',');
    const obj = {
      time: new Date(`${params[0].replaceAll('.', '-')} ${params[1]}`),
      // open: Number.parseFloat(params[2]),
      // high: Number.parseFloat(params[3]),
      // low: Number.parseFloat(params[4]),
      close: Number.parseFloat(params[5]),
      // volumen: Number.parseFloat(params[6], 10),
    };
    array.push(obj);
  });
  return array;
}
