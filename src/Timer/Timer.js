import React from "react";

import { TIMER_STATUS } from "../constants";

import styles from "./Timer.module.css";

function Timer({ limit, status, currentTime }) {
  const getLabel = () => {
    if (currentTime === 0) {
      return limit;
    }

    return currentTime;
  };

  const label = getLabel();

  return (
    <div className={styles.container}>
      <div className={styles.timer}>{label}</div>
    </div>
  );
}

export default Timer;
