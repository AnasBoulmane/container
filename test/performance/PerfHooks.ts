import { performance, PerformanceEntry, PerformanceObserver } from "perf_hooks";

type Funct = (...arg: any[]) => any;

export const useTimerify = (funct: Funct): [ Funct, Promise<PerformanceEntry>] => {
  let obs: PerformanceObserver;
  const timerData = new Promise<PerformanceEntry>((resolve, reject) => {
    obs = new PerformanceObserver((list) => {
      resolve(list.getEntries()[0]);
      obs.disconnect();
    });
  });
  const wrapped = (...args: any[]) => {
    if (obs) { obs.observe({ entryTypes: ["function"] }); }
    return performance.timerify(funct)(...args);
  };
  return [ wrapped, timerData ];
};
