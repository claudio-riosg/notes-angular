import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';

setupZoneTestEnv();

Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(document, 'doctype', { value: '<!DOCTYPE html>' });

if (typeof Element !== 'undefined') {
  // @ts-expect-error augment JSDOM
  Element.prototype.animate = jest.fn().mockReturnValue({
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    cancel: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    finish: jest.fn(),
    onfinish: null,
    currentTime: 0,
    startTime: null,
    playbackRate: 1,
    playState: 'idle',
    pending: false,
  });
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    display: 'none',
    appearance: ['-webkit-appearance'],
    getPropertyValue: () => '',
  }),
});

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
});

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), provideNoopAnimations()],
  });
});


