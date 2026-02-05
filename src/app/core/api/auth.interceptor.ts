import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AUTH_TOKEN_KEY } from './api.tokens';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenKey = inject(AUTH_TOKEN_KEY);
  const token = localStorage.getItem(tokenKey);

  if (token) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(authReq);
  }

  return next(req);
};
