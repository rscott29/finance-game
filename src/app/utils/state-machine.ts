type State = {
  name: string;
  onEnter?: () => void;
};

export class StateMachine {
  private states: Map<string, State>;
  private currentState: State | undefined;
  private id: string;
  private context: Object | undefined;
  private isChangingState: boolean;
  private changingStateQueue: string[];

  constructor(id: string, context: Object | undefined) {
    this.id = id;
    this.context = context;
    this.isChangingState = false;
    this.changingStateQueue = [];
    this.currentState = undefined;
    this.states = new Map();
  }

  get currentStateName(): string | undefined {
    return this.currentState?.name;
  }

  update() {
    if (this.changingStateQueue.length > 0) {
      this.setState(this.changingStateQueue.shift() ?? '');
    }
  }
  setState(name: string) {
    const methodName = 'setState';
    if (!this.states.has(name)) {
      console.warn(
        `[${StateMachine.name}-${this.id}:${methodName}] tried to change to unkown state: ${name}`
      );
      return;
    }
    if (this.isCurrentState(name)) {
      return;
    }

    if (this.isChangingState) {
      this.changingStateQueue.push(name);
      return;
    }

    this.isChangingState = true;
    console.log(
      `[${StateMachine.name}-${this.id}:${methodName}] change from ${
        this.currentState?.name ?? 'none'
      } to  ${name}`
    );
    this.currentState = this.states.get(name);

    if (this.currentState?.onEnter) {
      console.log(
        `[${StateMachine.name}-${this.id}:${methodName}]  ${this.currentState?.name} on enter invoked`
      );
      this.currentState.onEnter();
    }
    this.isChangingState = false;
  }

  addState(state: State) {
    this.states.set(state.name, {
      name: state.name,
      onEnter: this.context ? state.onEnter?.bind(this.context) : state.onEnter,
    });
  }

  private isCurrentState(name: string): boolean {
    if (!this.currentState) {
      return false;
    }
    return this.currentState.name === name;
  }
}
