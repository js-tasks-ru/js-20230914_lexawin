export default class RangePickerDate {
  static getFirstDateOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
  static getPrevMonthFirstDate = (date) => new Date(date.getFullYear(), date.getMonth() - 1, 1);
  static getNextMonthFirstDate = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 1);
  static getLongMonthName = (date) => date.toLocaleDateString("default", { month: "long" });
  static getDayOfWeek = (date) => {
    let dayOfWeek = date.getDay();
    if (dayOfWeek === 0) return 7;
    return dayOfWeek;
  };
  static getLocalISOString = (date) => {
    const offset = date.getTimezoneOffset();
    const offsetAbs = Math.abs(offset);
    const isoString = new Date(date.getTime() - offset * 60 * 1000).toISOString();
    return `${isoString.slice(0, -1)}${offset > 0 ? "-" : "+"}${String(Math.floor(offsetAbs / 60)).padStart(
      2,
      "0"
    )}:${String(offsetAbs % 60).padStart(2, "0")}`;
  };
}
