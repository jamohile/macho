import { Macho } from "../src";
import { MachoSubscriptionManager } from "../src/MachoSubscriptionManager";

describe("MachoSubscriptionManager", () => {
  let machoMock: Macho<any>;
  
  beforeEach(() => {
    machoMock = {} as Macho<any>;
  })

  it("can instantiate", () => {
    const sm = new MachoSubscriptionManager(machoMock);
  });

  it("can add subscriptions", () => {
    const sm = new  MachoSubscriptionManager(machoMock);
    sm.add(() => {});
    sm.add(() => {});
    expect(sm.size()).toBe(2);
  });

  it("can remove subscriptions", () => {
    const sm = new  MachoSubscriptionManager(machoMock);
    const unsub1 = sm.add(() => {});
    const unsub2 = sm.add(() => {});
    const unsub3 = sm.add(() => {});

    unsub2();
    
    expect(sm.size()).toBe(2);
  });

  it("can notify subscriptions", () => {
    const sub1 = jest.fn();
    const sub2 = jest.fn();

    const data = {foo: "bar"};

    const sm = new MachoSubscriptionManager(machoMock);
    sm.add(sub1);
    sm.add(sub2);

    sm.notify(data);
    expect(sub1).toHaveBeenCalledWith(data);
    expect(sub2).toHaveBeenCalledWith(data);
  });
});