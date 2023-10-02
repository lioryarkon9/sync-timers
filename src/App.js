import React from "react";

import { TIMER_STATUS, DEMO_TIMER } from "./constants";

import Timer from "./Timer/Timer";

import styles from "./App.module.css";
import "./index.css";

const INITIAL_STATE = {};

function App() {
  const [timers, setTimers] = React.useState(INITIAL_STATE);
  const [newTimerLimit, setNewTimerLimit] = React.useState(null);
  const timeoutIds = React.useRef({});
  const intervalIds = React.useRef({});

  const timersByLimitDescending = Object.values(timers).sort(
    ({ limit: limitA }, { limit: limitB }) => {
      if (limitA > limitB) {
        return -1;
      } else {
        return 1;
      }
    }
  );

  const isTimer = timersByLimitDescending.length > 0;
  const isPaused =
    isTimer > 0 &&
    timersByLimitDescending.every(
      (timer) => timer.status === TIMER_STATUS.PAUSED
    );
  const isActivated =
    isTimer > 0 &&
    timersByLimitDescending.every(
      (timer) => timer.status !== TIMER_STATUS.NOT_STARTED
    );
  const isInitialState =
    isTimer &&
    timersByLimitDescending.every(
      (timer) => timer.status === TIMER_STATUS.NOT_STARTED
    );
  const isRunning =
    isTimer &&
    timersByLimitDescending.every(
      (timer) => timer.status === TIMER_STATUS.RUNNING
    );
  const isResetted = timersByLimitDescending.every(
    (timer) => timer.status === TIMER_STATUS.RESETTED
  );

  const showIntentToCreateNewTimer = () => setNewTimerLimit({ value: "" });
  const addNew = () => {
    const timerId = crypto.randomUUID();
    let timerLimit;

    if (newTimerLimit && newTimerLimit.value) {
      timerLimit = parseInt(newTimerLimit.value);
    } else {
      timerLimit = 10;
    }

    const newTimer = {
      ...DEMO_TIMER,
      id: timerId,
      limit: timerLimit,
    };

    setTimers({
      ...timers,
      [newTimer.id]: newTimer,
    });
  };
  const onClickAddNew = (event) => {
    addNew({ limit: event.target.value });
    setNewTimerLimit(null);
  };

  const tickTimerIfPossible = (timerId) => {
    setTimers((previousState) => {
      const isTickRequired =
        previousState[timerId].currentTime < previousState[timerId].limit;

      if (!isTickRequired) {
        return {
          ...previousState,
          [timerId]: {
            ...previousState[timerId],
            status: TIMER_STATUS.FINISHED,
          },
        };
      }

      return {
        ...previousState,
        [timerId]: {
          ...previousState[timerId],
          currentTime: previousState[timerId].currentTime + 1,
          status: TIMER_STATUS.RUNNING,
        },
      };
    });
  };

  const applyInterval = ({ timerId, callback, interval = 1000 }) => {
    intervalIds.current[timerId] = setInterval(callback, interval);
  };
  const applyTimeout = ({ timerId, callback, delay }) => {
    timeoutIds.current[timerId] = setTimeout(callback, delay);
  };
  const removeInterval = (timerId) => {
    if (!intervalIds.current[timerId]) {
      return;
    }

    clearInterval(intervalIds.current[timerId]);
    delete intervalIds.current[timerId];
  };
  const removeTimeout = (timerId) => {
    if (!timeoutIds.current[timerId]) {
      return;
    }
    clearTimeout(timeoutIds.current[timerId]);
    delete timeoutIds.current[timerId];
  };

  const stopCurrentAndFutureTicking = () => {
    timersByLimitDescending.forEach((timer) => {
      removeInterval(timer.id);
      removeTimeout(timer.id);
    });
  };

  const start = () => {
    timersByLimitDescending.forEach((timer, index, self) => {
      const isTopLimitTimer = index === 0;

      if (isTopLimitTimer) {
        applyInterval({
          timerId: timer.id,
          callback: () => tickTimerIfPossible(timer.id),
        });

        return;
      }

      const isInitialStart = self[0].currentTime === 0;
      let timerDelay;

      if (isInitialStart) {
        timerDelay = self[0].limit - timer.limit;
      } else {
        timerDelay = self[0].limit - timer.limit - self[0].currentTime;

        if (timerDelay < 0) {
          timerDelay = null;
        }
      }

      if (timerDelay === null) {
        applyInterval({
          timerId: timer.id,
          callback: () => tickTimerIfPossible(timer.id),
        });
      } else {
        applyTimeout({
          timerId: timer.id,
          callback: () =>
            applyInterval({
              timerId: timer.id,
              callback: () => tickTimerIfPossible(timer.id),
            }),
          delay: timerDelay * 1000,
        });
      }
    });

    setTimers((previousState) => {
      const updatedState = Object.values(previousState).reduce(
        (newState, timer) => {
          newState[timer.id] = {
            ...timer,
            status: TIMER_STATUS.RUNNING,
          };

          return newState;
        },
        {}
      );

      return updatedState;
    });
  };

  const reset = () => {
    stopCurrentAndFutureTicking();
    setTimers((previousState) => {
      const updatedState = Object.values(previousState).reduce(
        (newState, timer) => {
          newState[timer.id] = {
            ...timer,
            currentTime: 0,
            status: TIMER_STATUS.RESETTED,
          };

          return newState;
        },
        {}
      );

      return updatedState;
    });
  };

  const stop = () => {
    stopCurrentAndFutureTicking();
    setTimers((previousState) => {
      const timersList = Object.values(previousState);

      if (timersList.every((timer) => timer.status === TIMER_STATUS.STOPPED)) {
        return INITIAL_STATE;
      }

      const updatedState = timersList.reduce((newState, timer) => {
        newState[timer.id] = {
          ...timer,
          status: TIMER_STATUS.STOPPED,
        };

        return newState;
      }, {});

      return updatedState;
    });
  };

  const pause = () => {
    stopCurrentAndFutureTicking();
    setTimers((previousState) => {
      const updatedState = Object.values(previousState).reduce(
        (newState, timer) => {
          newState[timer.id] = {
            ...timer,
            status: TIMER_STATUS.PAUSED,
          };

          return newState;
        },
        {}
      );

      return updatedState;
    });
  };

  const deleteAll = () => {
    stopCurrentAndFutureTicking();
    setTimers(INITIAL_STATE);
  };

  const pauseButtonLabel = isPaused ? "Resume" : "Pause";
  const pauseButtonAction = isPaused ? start : pause;

  React.useEffect(() => {
    if (isResetted) {
      start();
    }
  }, [isResetted]);

  return (
    <div className={styles.page}>
      <dialog className={styles.dialog} open={newTimerLimit !== null}>
        <input
          type="number"
          onChange={(event) => setNewTimerLimit({ value: event.target.value })}
          value={newTimerLimit?.value ?? ""}
          placeholder="Time in Seconds"
        />
        <button onClick={onClickAddNew}>Confirm</button>
        <button onClick={() => setNewTimerLimit(null)}>Close</button>
      </dialog>
      <h2 className={styles.header}>
        {!isRunning && (
          <button onClick={showIntentToCreateNewTimer}>Add New</button>
        )}
        {isTimer && <button onClick={deleteAll}>Delete All</button>}
        {isInitialState && <button onClick={start}>Start</button>}
        {isActivated && (
          <>
            <button onClick={pauseButtonAction}>{pauseButtonLabel}</button>
            <button onClick={stop}>Stop</button>
            <button onClick={reset}>Reset</button>
          </>
        )}
      </h2>

      <div className={styles.pageContainer}>
        {Object.values(timers).map((timer) => (
          <div className={styles.itemContainer} key={timer.id}>
            <Timer {...timer} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
