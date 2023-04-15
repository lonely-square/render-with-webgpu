export function tools(): {
    debounce: (fn: Function, timeout: number, ...args: any[]) => void;
    throttle: (fn: Function, timeout: number, ...args: any[]) => void;
  } {
    let timer1: NodeJS.Timeout | null = null;
    let timer2: NodeJS.Timeout | null = null,
      last: number,
      flag = 0;
    return {
      //防抖
      debounce: function (fn: Function, timeout: number, ...args: any[]) {
        timer1 && clearTimeout(timer1);
        timer1 = setTimeout(() => {
          fn.apply(this, args);
        }, timeout);
      },
      //节流
      throttle: function (fn: Function, timeout: number, ...args: any[]) {
        let now = Date.now();
        if (last && now < last + timeout) {
          timer2 && clearTimeout(timer2);
          //保证计时器方法一定在点击方法以前
          flag = 0;
          timer2 = setTimeout(() => {
            let now = Date.now();
            last = now;
            flag === 0 && fn.apply(this, args);
            //确保使间隔相同
          }, timeout - (now - last));
        } else {
          last = now;
          fn.apply(this, args);
          flag = 1;
        }
      },
    };
  }