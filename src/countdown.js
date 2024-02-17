import React, { useState, useEffect } from "react";

const CountdownTimer = ({ startTime }) => {
  const [remainingTime, setRemainingTime] = useState(
    calculateRemainingTime(startTime)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const newRemainingTime = calculateRemainingTime(startTime);
      setRemainingTime(newRemainingTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const calculateRemainingTime = (startTime) => {
    const now = new Date().getTime();
    const startTimeInMillis = new Date(startTime).getTime(); // Convert datetime to milliseconds
    const endTimeInMillis = startTimeInMillis + 30 * 60 * 1000; // Add 30 minutes
    let difference = endTimeInMillis - now;
    if (difference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
  };

  return (
    <div>
      <h2>Countdown Timer</h2>
      <p>{`${remainingTime.minutes
        .toString()
        .padStart(2, "0")}:${remainingTime.seconds
        .toString()
        .padStart(2, "0")}`}</p>
    </div>
  );
};

export default CountdownTimer;
