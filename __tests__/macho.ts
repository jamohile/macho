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

  it("can update", () => {
    const m = new Macho<any>({});
    m.set("foo");
    m.update(data => {
      expect(data).toBe("foo")
      return data.toUpperCase();
    })
    expect(m.lastData()).toBe("FOO");
  });

  it("can tell if data exists", () => {
    const m = new Macho<any>({});
    expect(m.hasData()).toBe(false);
    m.set("foo");
    expect(m.hasData()).toBe(true);
  });


  it("handles longer subscription", (done) => {
    let times = 0;
    const m = new Macho<any>({
      worker: set => {
        const handle = setInterval(() => {
          times += 1;
          set(times);
        }, 50);
        return () => clearInterval(handle);
      },
      workerProps: {persist: true}
    });
    setTimeout(() => {
      m.worker.stop(true);
      for (let i = 1; i <= times; i += 1) {
        expect(m.set).toHaveBeenNthCalledWith(i, i)
      }
      done();
    }, 1000);
  })
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