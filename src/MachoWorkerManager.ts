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
    if (this.props.persist) {
      this.scale();
    }
  }

  scale() {
    const isEmpty = this.macho.subscriptions.size() == 0;
    const isRunning = this.state === MachoWorkerStates.RUNNING;

    if (isEmpty && isRunning && !this.props.persist) {
      this.scheduleStop(true);
      return;
    } else if (!isEmpty && !isRunning) {
      this.start(true);
    }
  }

  scheduleStop(hard: boolean = true) {
    this.cancelStop();
    //@ts-ignore
    this.scheduledStop = setTimeout(() => this.stop(hard), this.props.delayShutdown || 0);
    this.state = MachoWorkerStates.PENDING_STOP;
  }

  // Returns true if it actually did cancel.
  cancelStop() {
    if (this.scheduledStop) {
      clearTimeout(this.scheduledStop);
      this.scheduledStop = undefined;
      this.state = MachoWorkerStates.RUNNING;
      return true;
    }
    return false;
  }

  stop(hard: boolean) {
    if (hard) {
      this.macho.dependencies.unsubscribeAll();
    }
    if (this.unsubscriber) {
      this.unsubscriber();
      this.unsubscriber = undefined;
    }
    this.state = MachoWorkerStates.STOPPED;
  }

  start(hard: boolean) {
    const didCancel = this.cancelStop();
    if (didCancel) {
      return;
    }
    if (hard) {
      this.macho.dependencies.subscribeAll();
    }
    this.unsubscriber = this.worker(data => this.macho.set(data));
    this.state = MachoWorkerStates.RUNNING;
  }

  refresh() {
    this.stop(false);
    this.start(false);
  }
}
