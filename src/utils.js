import _ from "lodash";
export const stringifyTimestamp = n => {
  let date = new Date(n);
  return `${_.padStart(date.getDate(), 2, "0")}/${_.padStart(
    date.getMonth() + 1,
    2,
    "0"
  )}/${date.getFullYear()} ${date.getHours()}:${_.padStart(date.getMinutes(), 2, "0")}`;
};
