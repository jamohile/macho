import { Macho } from "../src";
import { MachoDependencyManager } from "../src/MachoDependencyManager";

describe("MachoDependencyManager", () => {
  it("can instantiate empty", () => {
    const m = new Macho();
    const dm = new MachoDependencyManager(m, []);
  });

  it("can instantiate with dependents", () => {
    const m = new Macho();
    const m1 = new Macho();
    const m2 = new Macho();
    const dm = new MachoDependencyManager(m, [m1, m2]);
  });

  it("can subscribe to dependents", () => {
    const m = new Macho();
    const m1 = new Macho();
    const m2 = new Macho();

    const dm = new MachoDependencyManager(m, [m1, m2]);
    dm.subscribeAll();
    expect(m1.subscriptions.size()).toBe(1);
    expect(m2.subscriptions.size()).toBe(1);
  });

  it("can unsubscribe from dependents", () => {
    const m = new Macho();
    const m1 = new Macho();
    const m2 = new Macho();

    const dm = new MachoDependencyManager(m, [m1, m2]);
    dm.subscribeAll();
    dm.unsubscribeAll();
    expect(m1.subscriptions.size()).toBe(0);
    expect(m2.subscriptions.size()).toBe(0);
  });
});