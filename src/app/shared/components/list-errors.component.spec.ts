import { describe, it, expect, beforeEach } from 'vitest';
import { ListErrorsComponent } from './list-errors.component';

describe('ListErrorsComponent', () => {
  let component: ListErrorsComponent;

  beforeEach(() => {
    component = new ListErrorsComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty errorList', () => {
    expect(component.errorList).toEqual([]);
  });

  it('should set errorList from errors input', () => {
    component.errors = { errors: { email: 'is required', password: 'is too short' } };
    expect(component.errorList).toEqual(['email is required', 'password is too short']);
  });

  it('should set errorList to empty when errors is null', () => {
    component.errors = null;
    expect(component.errorList).toEqual([]);
  });

  it('should handle errors with empty errors object', () => {
    component.errors = { errors: {} };
    expect(component.errorList).toEqual([]);
  });
});
