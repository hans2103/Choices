import { getClassNames } from '../lib/utils';
import { SELECT_ONE_TYPE } from '../constants';
import { ClassNames } from '../interfaces/class-names';
import { PositionOptionsType } from '../interfaces/position-options-type';
import { PassedElementType } from '../interfaces/passed-element-type';

export default class Container {
  element: HTMLElement;

  type: PassedElementType;

  classNames: ClassNames;

  position: PositionOptionsType;

  isOpen: boolean;

  isFlipped: boolean;

  isDisabled: boolean;

  isLoading: boolean;

  constructor({
    element,
    type,
    classNames,
    position,
  }: {
    element: HTMLElement;
    type: PassedElementType;
    classNames: ClassNames;
    position: PositionOptionsType;
  }) {
    this.element = element;
    this.classNames = classNames;
    this.type = type;
    this.position = position;
    this.isOpen = false;
    this.isFlipped = false;
    this.isDisabled = false;
    this.isLoading = false;
  }

  /**
   * Determine whether container should be flipped based on passed
   * dropdown position
   */
  shouldFlip(dropdownPos: number): boolean {
    // If flip is enabled and the dropdown bottom position is
    // greater than the window height flip the dropdown.
    let shouldFlip = false;
    if (this.position === 'auto') {
      shouldFlip = !window.matchMedia(`(min-height: ${dropdownPos + 1}px)`).matches;
    } else if (this.position === 'top') {
      shouldFlip = true;
    }

    return shouldFlip;
  }

  setActiveDescendant(activeDescendantID: string): void {
    this.element.setAttribute('aria-activedescendant', activeDescendantID);
  }

  removeActiveDescendant(): void {
    this.element.removeAttribute('aria-activedescendant');
  }

  open(dropdownPos: number): void {
    this.element.classList.add(...getClassNames(this.classNames.openState));
    this.element.setAttribute('aria-expanded', 'true');
    this.isOpen = true;

    if (this.shouldFlip(dropdownPos)) {
      this.element.classList.add(...getClassNames(this.classNames.flippedState));
      this.isFlipped = true;
    }
  }

  close(): void {
    this.element.classList.remove(...getClassNames(this.classNames.openState));
    this.element.setAttribute('aria-expanded', 'false');
    this.removeActiveDescendant();
    this.isOpen = false;

    // A dropdown flips if it does not have space within the page
    if (this.isFlipped) {
      this.element.classList.remove(...getClassNames(this.classNames.flippedState));
      this.isFlipped = false;
    }
  }

  addFocusState(): void {
    this.element.classList.add(...getClassNames(this.classNames.focusState));
  }

  removeFocusState(): void {
    this.element.classList.remove(...getClassNames(this.classNames.focusState));
  }

  enable(): void {
    this.element.classList.remove(...getClassNames(this.classNames.disabledState));
    this.element.removeAttribute('aria-disabled');
    if (this.type === SELECT_ONE_TYPE) {
      this.element.setAttribute('tabindex', '0');
    }
    this.isDisabled = false;
  }

  disable(): void {
    this.element.classList.add(...getClassNames(this.classNames.disabledState));
    this.element.setAttribute('aria-disabled', 'true');
    if (this.type === SELECT_ONE_TYPE) {
      this.element.setAttribute('tabindex', '-1');
    }
    this.isDisabled = true;
  }

  wrap(element: HTMLElement): void {
    const { parentNode } = element;
    if (parentNode) {
      if (element.nextSibling) {
        parentNode.insertBefore(this.element, element.nextSibling);
      } else {
        parentNode.appendChild(this.element);
      }
    }

    this.element.appendChild(element);
  }

  unwrap(element: HTMLElement): void {
    const { parentNode } = this.element;
    if (parentNode) {
      // Move passed element outside this element
      parentNode.insertBefore(element, this.element);
      // Remove this element
      parentNode.removeChild(this.element);
    }
  }

  addLoadingState(): void {
    this.element.classList.add(...getClassNames(this.classNames.loadingState));
    this.element.setAttribute('aria-busy', 'true');
    this.isLoading = true;
  }

  removeLoadingState(): void {
    this.element.classList.remove(...getClassNames(this.classNames.loadingState));
    this.element.removeAttribute('aria-busy');
    this.isLoading = false;
  }
}
