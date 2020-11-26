import {Macho, Unsubscriber } from "./index";

export type MachoDependencies = {macho: Macho<any>, unsubscriber: Unsubscriber}[];

export class MachoDependencyManager {
  dependencies: MachoDependencies;
  macho: Macho<any>;

  constructor(macho: Macho<any>, dependencies: Macho<any>[]) {
    this.macho = macho;
    this.dependencies = dependencies.map(macho => ({ macho, unsubscriber: undefined }));
  }

  subscribeAll() {
    for (let dependency of this.dependencies) {
      const unsubscriber = dependency.macho.subscribe(() => this.macho.worker.refresh());
      dependency["unsubscriber"] = unsubscriber;
    }
  }

  unsubscribeAll() {
    for (let dependency of this.dependencies) {
      if (dependency.unsubscriber) {
        dependency.unsubscriber();
        dependency["unsubscriber"] = undefined;
      }
    }
  }
}
