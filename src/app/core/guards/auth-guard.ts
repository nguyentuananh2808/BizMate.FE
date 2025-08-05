import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = localStorage.getItem('access_token');

    // Nếu không có token → chuyển về trang đăng nhập
    if (!token) {
      return this.router.parseUrl('/login');
    }

    try {
      const decoded: any = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      // Token hết hạn → xóa local và chuyển hướng login
      if (isExpired) {
        localStorage.clear();
        return this.router.parseUrl('/login');
      }

      return true;
    } catch (err) {
      // Token lỗi → redirect login
      localStorage.clear();
      return this.router.parseUrl('/login');
    }
  }
}
