import { MachoDependencyManager } from "./MachoDependencyManager";
import { MachoSubscriptionManager, MachoSubscriptionProps } from "./MachoSubscriptionManager";
import { MachoWorker, MachoWorkerManager, MachoWorkerProps } from "./MachoWorkerManager";

export type Unsubscriber = (() => void) | void;
export type MachoUnsubscriber = () => void;
export type Setter<T> = (value: T) => void;
export type MachoListener<T> = (val: T) => void;


export interface MachoProps<T> {
  worker?: MachoWorker<T>;
  dependencies?: Macho<any>[];
  initial?:T;
  
  workerProps?: MachoWorkerProps;
  subscriptionProps?: MachoSubscriptionProps;
}
export class Macho<T> {
  data: T | undefined;

  dependencies: MachoDependencyManager;
  worker: MachoWorkerManager<T>;
  subscriptions: MachoSubscriptionManager<T>;

  constructor(props: MachoProps<T> = {}) {
    this.dependencies = new MachoDependencyManager(this, props.dependencies || []);
    this.subscriptions = new MachoSubscriptionManager(this, props.subscriptionProps);
    this.worker = new MachoWorkerManager(this, props.worker, props);
    this.data = props.initial;
  }

  subscribe(listener: MachoListener<T>): MachoUnsubscriber {
    const unsubscriber = this.subscriptions.add(listener);
    this.worker.scale();
    return unsubscriber;
  }

  unsubscribe(id: number) {
    this.subscriptions.remove(id);
    this.worker.scale();
  }

  lastData(): T | undefined {
    return this.data;
  }
  
  set(val: T) {
    this.data = val;
    this.subscriptions.notify(this.data);
  }

  update(handler: (data: T) => T) {
    this.set(handler(this.lastData() as T));
  }

  hasData(): boolean {
    return this.lastData() !== undefined;
  }
}

// const macho1 = new Macho(set => {
//   set(1);
//   return () => {}
// }, false, []);

// console.log(macho1.lastData());

// const unsub1 = macho1.subscribe((data) => {
//   console.log("listener 1: " + data);
// });

// const macho2 = new Macho(set => {
//   set(2 * (macho1.lastData() as number));
//   return () => {};
// }, false, [macho1]);

// const unsub2 = macho2.subscribe((data) => {
//   console.log("listener 2: " + data);
// });

// macho1.set(2);

// unsub1();
// unsub2();
