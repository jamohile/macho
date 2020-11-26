import { Macho } from "../src";

describe("Macho, high level", () => {
  it("can instantiate", () => {
    const m = new Macho<any>({});
  });

  it("can subscribe", () => {
    const m = new Macho<any>({});
    m.subscribe(() => {});
    expect(m.subscriptions.size()).toBe(1);
  });

  it("can unsubscribe", () => {
    const m = new Macho<any>({});
    const unsub = m.subscribe(() => {});
    unsub();
    expect(m.subscriptions.size()).toBe(0);
  });

  it("can return last data", () => {
    const m = new Macho<any>({});
    m.set("foo");
    expect(m.lastData()).toBe("foo");
  });
});

describe("Macho, dependency bubbling", () => {
  it("can use data from dependents", () => {
    const m1 = new Macho<number>();
    const m2 = new Macho<number>({
      worker: set => {
        if (m1.lastData()) {
          set((m1.lastData() as number) * 10);
        }
      },
      dependencies: [m1]
    });
    
    const m2Spy = jest.fn();
    m2.subscribe(m2Spy);

    m1.set(10);
    expect(m2Spy).toHaveBeenCalledWith(100);
  })
});