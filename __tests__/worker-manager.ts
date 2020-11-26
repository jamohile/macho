import { Macho } from "../src";
import { MachoWorkerManager, MachoWorkerStates } from "../src/MachoWorkerManager";

describe("MachoWorkerManager", () => {
  let machoMock: Macho<any>;
  
  beforeEach(() => {
    machoMock = {
      set: jest.fn(),
      dependencies: {
        unsubscribeAll: jest.fn(),
        subscribeAll: jest.fn()
      },
      subscriptions: {
        size: jest.fn()
      }
    } as unknown as Macho<any>;
  })

  it("can instantiate", () => {
    const wm = new MachoWorkerManager(machoMock, () => {}, {});
  });

  it("can be started", () => {
    const data = {foo: "bar"}
    const wm = new MachoWorkerManager(machoMock, set => set(data), {});
    wm.start(false);
    expect(machoMock.set).toHaveBeenCalledWith(data);
  });

  it("can be hard-started", () => {
    const wm = new MachoWorkerManager(machoMock, () => {}, {});
    wm.start(true);
    expect(machoMock.dependencies.subscribeAll).toHaveBeenCalled();
  });

  it("automatically starts if persist is true", () => {
    const wm = new MachoWorkerManager(machoMock, set => set({}), {
      workerProps: {persist: true}
    });
    expect(wm.macho.set).toHaveBeenCalledTimes(1);
  });

  it("can be stopped", () => {
    const stopSpy = jest.fn();
    const wm = new MachoWorkerManager(machoMock, () => stopSpy, {});
    wm.start(true);
    expect(stopSpy).not.toHaveBeenCalled();
    wm.stop(true);
    expect(stopSpy).toHaveBeenCalled();
  });

  it("can be refreshed", () => {
    const data = {foo: "bar"}
    const wm = new MachoWorkerManager(machoMock, set => set(data), {});
    wm.start(true);
    wm.refresh();
    expect(machoMock.set).toHaveBeenCalledTimes(2);
  });

  it("will start if subscribed to while stopped.", () => {
    const wm = new MachoWorkerManager(machoMock, set => {set({})}, {});
    //@ts-ignore
    machoMock.subscriptions.size.mockReturnValue(1);
    expect(machoMock.set).toHaveBeenCalledTimes(0);
    wm.scale();
    expect(machoMock.set).toHaveBeenCalledTimes(1);
  });

  it("will not add more workers if subscribed to while running.", () => {
    const wm = new MachoWorkerManager(machoMock, set => {set({})}, {});
    //@ts-ignore
    machoMock.subscriptions.size.mockReturnValue(1);
    expect(machoMock.set).toHaveBeenCalledTimes(0);
    wm.scale();
    expect(machoMock.set).toHaveBeenCalledTimes(1);

    //@ts-ignore
    machoMock.subscriptions.size.mockReturnValue(2);
    wm.scale();
    expect(machoMock.set).toHaveBeenCalledTimes(1);
  });

  it("will delay stop if option is set", (done) => {
    const wm = new MachoWorkerManager(machoMock, set => {set({})}, {
      workerProps: {delayShutdown: 500}
    });
    //@ts-ignore
    machoMock.subscriptions.size.mockReturnValue(0);
    wm.start(true);
    wm.scale();
    // Should shut down eventually, but not right away.
    expect(wm.state).toBe(MachoWorkerStates.PENDING_STOP);
    // Now should be stopped.
    setTimeout(() => {
      expect(wm.state).toBe(MachoWorkerStates.STOPPED);
      done();
    }, 550);
  });

  it("can interrupt scheduled stop.", (done) => {
    const wm = new MachoWorkerManager(machoMock, set => {set({})}, {
      workerProps: {delayShutdown: 500}
    });

    wm.start(true);
    expect(machoMock.set).toHaveBeenCalledTimes(1);
    //@ts-ignore
    machoMock.subscriptions.size.mockReturnValue(0);
    wm.scale();
    // A stop should now be scheduled.

    // Interrupt the stop after some short time.
    setTimeout(() => {
      //@ts-ignore
      machoMock.subscriptions.size.mockReturnValue(2);
      wm.scale();
      expect(wm.state).toBe(MachoWorkerStates.RUNNING);
      done();
    }, 200);
  });

  it("will not refresh workers when interrupting a scheduled stop", (done) => {
    const wm = new MachoWorkerManager(machoMock, set => {set({})}, {
      workerProps: {delayShutdown: 500}
    });

    wm.start(true);
    expect(machoMock.set).toHaveBeenCalledTimes(1);
    //@ts-ignore
    machoMock.subscriptions.size.mockReturnValue(0);
    wm.scale();
    // A stop should now be scheduled.

    // Interrupt the stop after some short time.
    setTimeout(() => {
      //@ts-ignore
      machoMock.subscriptions.size.mockReturnValue(2);
      wm.scale();
      expect(machoMock.set).toHaveBeenCalledTimes(1);
      done();
    }, 200);
  });
});