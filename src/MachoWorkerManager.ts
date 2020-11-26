import { Macho, Setter, Unsubscriber, MachoProps } from "./index";
import { MachoSubscriptionManager } from "./MachoSubscriptionManager";

export enum MachoWorkerStates {
  STOPPED,
  PENDING_STOP,
  RUNNING
}

export interface MachoWorkerProps {
  persist?: boolean;
  delayShutdown?: number;
}

export type MachoWorker<T> = (setter: Setter<T>) => Unsubscriber;

export class MachoWorkerManager<T> {
  macho: Macho<T>;
  worker: MachoWorker<T>;
  state: MachoWorkerStates = MachoWorkerStates.STOPPED;

  props: MachoWorkerProps;

  unsubscriber?: Unsubscriber;
  scheduledStop?: number;

  constructor(macho: Macho<T>, worker: MachoWorker<T>, props: MachoProps<T>) {
    this.macho = macho;
    this.worker = worker;
    this.props = props.workerProps || {};
  }

  scale() {
    const isEmpty = this.macho.subscriptions.size() == 0;
    const isRunning = this.unsubscriber !== undefined;

    if (isEmpty && isRunning && !this.props.persist) {
      this.scheduleStop(true);
      return;
    } else if (!isEmpty && !isRunning) {
      this.start(true);
    }
  }

  scheduleStop(hard: boolean = true) {
    this.cancelStop();
    this.scheduledStop = setTimeout(() => this.stop(hard), this.props.delayShutdown || 0);
    this.state = MachoWorkerStates.PENDING_STOP;
  }

  cancelStop() {
    if (this.scheduledStop) {
      clearTimeout(this.scheduledStop);
      this.scheduledStop = undefined;
    }
    this.state = this.unsubscriber ? MachoWorkerStates.RUNNING : MachoWorkerStates.STOPPED;
  }

  stop(hard: boolean) {
    if (this.unsubscriber) {
      this.unsubscriber();
      this.unsubscriber = undefined;
    }
    this.state = MachoWorkerStates.STOPPED;
    if (hard)
      this.macho.dependencies.unsubscribeAll();
  }

  start(hard: boolean) {
    this.cancelStop();
    this.unsubscriber = this.worker(data => this.macho.set(data));
    if (hard)
      this.macho.dependencies.subscribeAll();
    this.state = MachoWorkerStates.RUNNING;
  }

  refresh() {
    this.stop(false);
    this.start(false);
  }
}
