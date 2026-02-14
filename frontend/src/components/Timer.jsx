import { useEffect, useRef } from "react";
import { useStore } from "../context/StoreContext";
import { formatTime, getTimerColor } from "../utils/helpers";
import { Clock } from "lucide-react";

export default function Timer({ onExpire }) {
  const { testState, tickTimer } = useStore();
  const { timeLeft, date, startTime, endTime } = testState;

  const initialRef = useRef(timeLeft);
  const expiredRef = useRef(false);

  useEffect(() => {
    const now = new Date();

    // Combine date + time into full Date objects
    const testDate = new Date(date);

    const startDateTime = new Date(
      `${testDate.toDateString()} ${startTime}`
    );

    const endDateTime = new Date(
      `${testDate.toDateString()} ${endTime}`
    );

    // 🚨 If current date/time is outside test window → expire
    if (
      now < startDateTime ||
      now > endDateTime ||
      now.toDateString() !== testDate.toDateString()
    ) {
      if (!expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
      return;
    }

    // ⏳ If timer reached 0 → expire
    if (timeLeft <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
      return;
    }

    const id = setInterval(tickTimer, 1000);
    return () => clearInterval(id);
  }, [timeLeft, date, startTime, endTime]);

  const colorClass = getTimerColor(timeLeft, initialRef.current);
  const urgent = timeLeft < 60;

  return (
    <div
      className={`flex items-center gap-2 font-mono text-lg font-semibold ${colorClass} ${
        urgent ? "animate-pulse" : ""
      }`}
    >
      <Clock size={17} />
      {formatTime(timeLeft)}
    </div>
  );
}
