import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AUTH_TOKEN_KEY } from './api.tokens';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  const TOKEN_KEY = 'test_api_key';

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AUTH_TOKEN_KEY, useValue: TOKEN_KEY },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should add Authorization header when token exists', () => {
    localStorage.setItem(TOKEN_KEY, 'my-secret-key');

    http.get('/api/v1/projects').subscribe();

    const req = httpTesting.expectOne('/api/v1/projects');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-secret-key');
    req.flush([]);
  });

  it('should not add Authorization header when no token exists', () => {
    http.get('/api/v1/projects').subscribe();

    const req = httpTesting.expectOne('/api/v1/projects');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('should not modify existing headers', () => {
    localStorage.setItem(TOKEN_KEY, 'key');

    http.get('/api/v1/flags', { headers: { 'X-Custom': 'value' } }).subscribe();

    const req = httpTesting.expectOne('/api/v1/flags');
    expect(req.request.headers.get('X-Custom')).toBe('value');
    expect(req.request.headers.get('Authorization')).toBe('Bearer key');
    req.flush([]);
  });

  it('should use the configured token key from injection token', () => {
    localStorage.setItem('wrong_key', 'wrong-value');
    localStorage.setItem(TOKEN_KEY, 'correct-value');

    http.get('/api/v1/projects').subscribe();

    const req = httpTesting.expectOne('/api/v1/projects');
    expect(req.request.headers.get('Authorization')).toBe('Bearer correct-value');
    req.flush([]);
  });
});
