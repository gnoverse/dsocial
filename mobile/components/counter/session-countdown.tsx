import { View } from "react-native";
import Text from "../text";
import { useEffect, useState } from "react";

interface Props { time?: number }

function calculateTimeLeft(time: number): string {
  const difference = time - new Date().getTime();
  let timeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }

  return `${timeLeft.days === 0 ? "" : timeLeft.days + "d"} ${timeLeft.hours === 0 ? "" : timeLeft.hours + "h"} ${timeLeft.minutes === 0 ? "" : timeLeft.minutes + "m"} ${timeLeft.seconds}s`
}


export function SessionCountDown({ time }: Props) {

  if (!time) return <View>
    <Text.Body>
      {/* No active session */}
    </Text.Body>
  </View>

  const [remainingTimeStr, setRemainingTimeStr] = useState('');

  useEffect(() => {
    setRemainingTimeStr(calculateTimeLeft(time));

    const interval = setInterval(() => {
      setRemainingTimeStr(calculateTimeLeft(time));
    }, 1000);
    return () => clearInterval(interval);
  }, [time]);

  return <View>
    <Text.Body>
      Session valid until {new Date(time).toISOString()}
    </Text.Body>
    <Text.Body>
      {remainingTimeStr}
    </Text.Body>
  </View>
}
