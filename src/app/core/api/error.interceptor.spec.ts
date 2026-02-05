import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ToastService } from '@/app/shared/ui/toast/toast.service';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let toastService: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    toastService = TestBed.inject(ToastService);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should not show toast on successful response', () => {
    http.get('/api/v1/projects').subscribe();

    const req = httpTesting.expectOne('/api/v1/projects');
    req.flush([]);

    expect(toastService.toasts()).toHaveLength(0);
  });

  it('should show API error message when server returns ApiError body', () => {
    http.get('/api/v1/projects').subscribe({ error: jest.fn() });

    const req = httpTesting.expectOne('/api/v1/projects');
    req.flush(
      { error: 'NOT_FOUND', message: 'Project not found' },
      { status: 404, statusText: 'Not Found' },
    );

    expect(toastService.toasts()).toHaveLength(1);
    expect(toastService.toasts()[0].message).toBe('Project not found');
  });

  it('should show connection error for status 0', () => {
    http.get('/api/v1/projects').subscribe({ error: jest.fn() });

    const req = httpTesting.expectOne('/api/v1/projects');
    req.error(new ProgressEvent('error'), { status: 0, statusText: '' });

    expect(toastService.toasts()[0].message).toContain('Unable to connect');
  });

  it('should show auth message for 401', () => {
    http.get('/api/v1/projects').subscribe({ error: jest.fn() });

    const req = httpTesting.expectOne('/api/v1/projects');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(toastService.toasts()[0].message).toContain('Authentication required');
  });

  it('should show permission message for 403', () => {
    http.get('/api/v1/projects').subscribe({ error: jest.fn() });

    const req = httpTesting.expectOne('/api/v1/projects');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(toastService.toasts()[0].message).toContain('permission');
  });

  it('should show not found message for 404 without ApiError body', () => {
    http.get('/api/v1/projects').subscribe({ error: jest.fn() });

    const req = httpTesting.expectOne('/api/v1/projects');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(toastService.toasts()[0].message).toContain('not found');
  });

  it('should show server error message for 500+', () => {
    http.get('/api/v1/projects').subscribe({ error: jest.fn() });

    const req = httpTesting.expectOne('/api/v1/projects');
    req.flush('Internal', { status: 500, statusText: 'Internal Server Error' });

    expect(toastService.toasts()[0].message).toContain('server error');
  });

  it('should re-throw the error so callers can handle it', () => {
    const errorSpy = jest.fn();
    http.get('/api/v1/projects').subscribe({ error: errorSpy });

    const req = httpTesting.expectOne('/api/v1/projects');
    req.flush('Error', { status: 400, statusText: 'Bad Request' });

    expect(errorSpy).toHaveBeenCalled();
  });

  it('should create error toasts that do not auto-dismiss', () => {
    jest.useFakeTimers();

    http.get('/api/v1/projects').subscribe({ error: jest.fn() });

    const req = httpTesting.expectOne('/api/v1/projects');
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' });

    jest.advanceTimersByTime(60000);

    expect(toastService.toasts()).toHaveLength(1);
    expect(toastService.toasts()[0].variant).toBe('error');

    jest.useRealTimers();
  });
});
