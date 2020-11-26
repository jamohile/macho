import { MachoListener, Macho } from "./index";

type MachoUnsubscriber = () => void;

export interface MachoSubscriptionProps {
  disableWelcomeNotify?: boolean
}

export class MachoSubscriptionManager<T> {
  subscriptions = new Map<number, MachoListener<T>>();
  macho: Macho<T>;
  props: MachoSubscriptionProps;

  constructor(macho: Macho<T>, props: MachoSubscriptionProps = {}) {
    this.macho = macho;
    this.props = props;
  }

  add(listener: MachoListener<T>): MachoUnsubscriber {
    for (let i = 0; i < 10; i+=1) {
      const id = Math.floor(Math.random() * 1000000);
      if (this.subscriptions.has(id)) {
        continue;
      }
      this.subscriptions.set(id, listener);
      if (!this.props.disableWelcomeNotify) {
        listener(this.macho.lastData() as T);
      }
      return () => this.remove(id);
    }
    throw new Error("Could not generate an ID for macho.")
  }

  remove(id: number) {
    this.subscriptions.delete(id);
  }

  size() {
    return this.subscriptions.size;
  }

  notify(data: T) {
    for (let subscription of this.subscriptions.values()) {
      subscription(data);
    }
  }

  getSubscriptions() {
    return this.subscriptions;
  }
}
