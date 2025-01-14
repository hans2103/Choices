import { ClassNames } from '../interfaces/class-names';
import { PassedElementType } from '../interfaces/passed-element-type';
import { getClassNames } from '../lib/utils';

export default class Dropdown {
  element: HTMLElement;

  type: PassedElementType;

  classNames: ClassNames;

  isActive: boolean;

  constructor({
    element,
    type,
    classNames,
  }: {
    element: HTMLElement;
    type: PassedElementType;
    classNames: ClassNames;
  }) {
    this.element = element;
    this.classNames = classNames;
    this.type = type;
    this.isActive = false;
  }

  /**
   * Show dropdown to user by adding active state class
   */
  show(): this {
    this.element.classList.add(...getClassNames(this.classNames.activeState));
    this.element.setAttribute('aria-expanded', 'true');
    this.isActive = true;

    return this;
  }

  /**
   * Hide dropdown from user
   */
  hide(): this {
    this.element.classList.remove(...getClassNames(this.classNames.activeState));
    this.element.setAttribute('aria-expanded', 'false');
    this.isActive = false;

    return this;
  }
}
