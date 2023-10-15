export default class Dates {
  static getFirstDateOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
  static getPrevMonthFirstDate = (date) => new Date(date.getFullYear(), date.getMonth() - 1, 1);
  static getNextMonthFirstDate = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 1);
  static getLongMonthName = (date) => date.toLocaleDateString("ru", { month: "long" });
  static getLocalDateString = (date) => date.toLocaleString("ru", { dateStyle: "short" });
  static getDayOfWeek = (date) => {
    let dayOfWeek = date.getDay();
    if (dayOfWeek === 0) return 7;
    return dayOfWeek;
  };
}
