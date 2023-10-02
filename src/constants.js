export const TIMER_STATUS = {
  NOT_STARTED: "NOT_STARTED",
  RUNNING: "RUNNING",
  PAUSED: "PAUSED",
  FINISHED: "FINISHED",
  STOPPED: "STOPPED",
  RESETTED: "RESETTED",
};

export const DEMO_TIMER = {
  id: "96b33efa-9597-46cb-9f71-f989cc4a8477",
  limit: 20, // seconds
  status: TIMER_STATUS.NOT_STARTED,
  currentTime: 0,
};
export const DEMO_TIMERS_STATE = {
  "96b33efa-9597-46cb-9f71-f989cc4a8477": DEMO_TIMER,
  "96b33efa-9597-46cb-9f71-f989cc4a8478": {
    ...DEMO_TIMER,
    id: "96b33efa-9597-46cb-9f71-f989cc4a8478",
    limit: 15,
  },
  "96b33efa-9597-46cb-9f71-f989cc4a8479": {
    ...DEMO_TIMER,
    id: "96b33efa-9597-46cb-9f71-f989cc4a8479",
    limit: 10,
  },
};
