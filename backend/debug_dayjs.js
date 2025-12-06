const dayjs = require("dayjs");
const isBetween = require("dayjs/plugin/isBetween");
const customParseFormat = require("dayjs/plugin/customParseFormat");

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

const startStr = "16:45:00";
const endStr = "17:30:00";
const nowStr = "17:02:01";

const start = dayjs(startStr, "HH:mm:ss");
const end = dayjs(endStr, "HH:mm:ss");
const nowTime = dayjs(nowStr, "HH:mm:ss");

console.log("Start:", start.format("YYYY-MM-DD HH:mm:ss"));
console.log("End:  ", end.format("YYYY-MM-DD HH:mm:ss"));
console.log("Now:  ", nowTime.format("YYYY-MM-DD HH:mm:ss"));

console.log("Is Between:", nowTime.isBetween(start, end, null, "[]"));
