export const secToTimeStr = (sec: number): string => {
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  return hours === 0
    ? `${minutes}:${("" + seconds).padStart(2, "0")}`
    : `${hours}:${("" + minutes).padStart(2, "0")}:${("" + seconds).padStart(
        2,
        "0"
      )}`;
};
