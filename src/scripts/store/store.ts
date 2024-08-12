import {
  AnyAction,
  Reducer,
  Store as IStore,
  StoreListener,
} from '../interfaces/store';
import { StateChangeSet, State } from '../interfaces/state';
import { ChoiceFull } from '../interfaces/choice-full';
import { GroupFull } from '../interfaces/group-full';
import items from '../reducers/items';
import groups from '../reducers/groups';
import choices from '../reducers/choices';

type ReducerList = { [K in keyof State]: Reducer<State[K]> };

const reducers: ReducerList = {
  groups,
  items,
  choices,
} as const;

export default class Store implements IStore {
  _store: State = this.defaultState;

  _listeners: StoreListener[] = [];

  _txn: number = 0;

  _outstandingChanges?: StateChangeSet;

  // eslint-disable-next-line class-methods-use-this
  get defaultState(): State {
    return {
      groups: [],
      items: [],
      choices: [],
    };
  }

  // eslint-disable-next-line class-methods-use-this
  changeSet(init: boolean): StateChangeSet {
    return {
      groups: init,
      items: init,
      choices: init,
    };
  }

  resetStore(): void {
    this._store = this.defaultState;
    const changes = this.changeSet(true);
    this._listeners.forEach((l) => l(changes));
  }

  subscribe(onChange: StoreListener): void {
    this._listeners.push(onChange);
  }

  dispatch(action: AnyAction): void {
    const state = this._store;
    let hasChanges = false;
    const changes = this._outstandingChanges || this.changeSet(false);

    Object.keys(reducers).forEach((key: string) => {
      const stateUpdate = (reducers[key] as Reducer<unknown>)(
        state[key],
        action,
      );
      if (stateUpdate.update) {
        hasChanges = true;
        changes[key] = true;
        state[key] = stateUpdate.state;
      }
    });

    if (hasChanges) {
      if (this._txn) {
        this._outstandingChanges = changes;
      } else {
        this._listeners.forEach((l) => l(changes));
      }
    }
  }

  withTxn(func: () => void): void {
    this._txn++;
    try {
      func();
    } finally {
      this._txn = Math.max(0, this._txn - 1);

      if (!this._txn) {
        const changeSet = this._outstandingChanges;
        if (changeSet) {
          this._outstandingChanges = undefined;
          this._listeners.forEach((l) => l(changeSet));
        }
      }
    }
  }

  /**
   * Get store object
   */
  get state(): State {
    return this._store;
  }

  /**
   * Get items from store
   */
  get items(): ChoiceFull[] {
    return this.state.items;
  }

  /**
   * Get highlighted items from store
   */
  get highlightedActiveItems(): ChoiceFull[] {
    return this.items.filter(
      (item) => !item.disabled && item.active && item.highlighted,
    );
  }

  /**
   * Get choices from store
   */
  get choices(): ChoiceFull[] {
    return this.state.choices;
  }

  /**
   * Get active choices from store
   */
  get activeChoices(): ChoiceFull[] {
    return this.choices.filter((choice) => choice.active);
  }

  /**
   * Get choices that can be searched (excluding placeholders)
   */
  get searchableChoices(): ChoiceFull[] {
    return this.choices.filter(
      (choice) => !choice.disabled && !choice.placeholder,
    );
  }

  /**
   * Get groups from store
   */
  get groups(): GroupFull[] {
    return this.state.groups;
  }

  /**
   * Get active groups from store
   */
  get activeGroups(): GroupFull[] {
    return this.state.groups.filter((group) => {
      const isActive = group.active && !group.disabled;
      const hasActiveOptions = this.state.choices.some(
        (choice) => choice.active && !choice.disabled,
      );

      return isActive && hasActiveOptions;
    }, []);
  }

  inTxn(): boolean {
    return this._txn > 0;
  }

  /**
   * Get single choice by it's ID
   */
  getChoiceById(id: number): ChoiceFull | undefined {
    return this.activeChoices.find((choice) => choice.id === id);
  }

  /**
   * Get group by group id
   */
  getGroupById(id: number): GroupFull | undefined {
    return this.groups.find((group) => group.id === id);
  }
}
