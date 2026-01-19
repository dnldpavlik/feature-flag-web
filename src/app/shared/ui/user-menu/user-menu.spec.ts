import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { UserMenuComponent } from './user-menu';

describe('UserMenu', () => {
  let component: UserMenuComponent;
  let fixture: ComponentFixture<UserMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserMenuComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('name', 'John Doe');
    fixture.componentRef.setInput('email', 'john@example.com');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render the container with user-menu class', () => {
      fixture.componentRef.setInput('name', 'John Doe');
      fixture.componentRef.setInput('email', 'john@example.com');
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.user-menu'));
      expect(container).toBeTruthy();
    });

    it('should render user name', () => {
      fixture.componentRef.setInput('name', 'John Doe');
      fixture.componentRef.setInput('email', 'john@example.com');
      fixture.detectChanges();

      const name = fixture.debugElement.query(By.css('.user-menu__name'));
      expect(name).toBeTruthy();
      expect(name.nativeElement.textContent).toContain('John Doe');
    });

    it('should render user email', () => {
      fixture.componentRef.setInput('name', 'John Doe');
      fixture.componentRef.setInput('email', 'john@example.com');
      fixture.detectChanges();

      const email = fixture.debugElement.query(By.css('.user-menu__email'));
      expect(email).toBeTruthy();
      expect(email.nativeElement.textContent).toContain('john@example.com');
    });
  });

  describe('avatar', () => {
    it('should render avatar container', () => {
      fixture.componentRef.setInput('name', 'John Doe');
      fixture.componentRef.setInput('email', 'john@example.com');
      fixture.detectChanges();

      const avatar = fixture.debugElement.query(By.css('.user-menu__avatar'));
      expect(avatar).toBeTruthy();
    });

    it('should display initials when no avatarUrl is provided', () => {
      fixture.componentRef.setInput('name', 'John Doe');
      fixture.componentRef.setInput('email', 'john@example.com');
      fixture.detectChanges();

      const initials = fixture.debugElement.query(By.css('.user-menu__initials'));
      expect(initials).toBeTruthy();
      expect(initials.nativeElement.textContent.trim()).toBe('JD');
    });

    it('should display single initial for single name', () => {
      fixture.componentRef.setInput('name', 'John');
      fixture.componentRef.setInput('email', 'john@example.com');
      fixture.detectChanges();

      const initials = fixture.debugElement.query(By.css('.user-menu__initials'));
      expect(initials.nativeElement.textContent.trim()).toBe('J');
    });

    it('should display image when avatarUrl is provided', () => {
      fixture.componentRef.setInput('name', 'John Doe');
      fixture.componentRef.setInput('email', 'john@example.com');
      fixture.componentRef.setInput('avatarUrl', 'https://example.com/avatar.jpg');
      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('.user-menu__avatar-img'));
      expect(img).toBeTruthy();
      expect(img.nativeElement.src).toBe('https://example.com/avatar.jpg');
    });

    it('should not display initials when avatarUrl is provided', () => {
      fixture.componentRef.setInput('name', 'John Doe');
      fixture.componentRef.setInput('email', 'john@example.com');
      fixture.componentRef.setInput('avatarUrl', 'https://example.com/avatar.jpg');
      fixture.detectChanges();

      const initials = fixture.debugElement.query(By.css('.user-menu__initials'));
      expect(initials).toBeFalsy();
    });
  });

  describe('click interaction', () => {
    it('should be a button element', () => {
      fixture.componentRef.setInput('name', 'John Doe');
      fixture.componentRef.setInput('email', 'john@example.com');
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button.user-menu'));
      expect(button).toBeTruthy();
    });

    it('should emit menuToggle on click', () => {
      fixture.componentRef.setInput('name', 'John Doe');
      fixture.componentRef.setInput('email', 'john@example.com');
      fixture.detectChanges();

      const spy = jest.fn();
      component.menuToggle.subscribe(spy);

      const button = fixture.debugElement.query(By.css('.user-menu'));
      button.nativeElement.click();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('compact mode', () => {
    it('should not be compact by default', () => {
      fixture.componentRef.setInput('name', 'John Doe');
      fixture.componentRef.setInput('email', 'john@example.com');
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.user-menu'));
      expect(container.nativeElement.classList.contains('user-menu--compact')).toBe(false);
    });

    it('should apply compact class when compact is true', () => {
      fixture.componentRef.setInput('name', 'John Doe');
      fixture.componentRef.setInput('email', 'john@example.com');
      fixture.componentRef.setInput('compact', true);
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.user-menu'));
      expect(container.nativeElement.classList.contains('user-menu--compact')).toBe(true);
    });

    it('should hide user info in compact mode', () => {
      fixture.componentRef.setInput('name', 'John Doe');
      fixture.componentRef.setInput('email', 'john@example.com');
      fixture.componentRef.setInput('compact', true);
      fixture.detectChanges();

      const info = fixture.debugElement.query(By.css('.user-menu__info'));
      expect(info).toBeFalsy();
    });
  });

  describe('accessibility', () => {
    it('should have aria-label', () => {
      fixture.componentRef.setInput('name', 'John Doe');
      fixture.componentRef.setInput('email', 'john@example.com');
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('.user-menu'));
      expect(button.nativeElement.getAttribute('aria-label')).toBe('User menu for John Doe');
    });

    it('should have aria-haspopup attribute', () => {
      fixture.componentRef.setInput('name', 'John Doe');
      fixture.componentRef.setInput('email', 'john@example.com');
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('.user-menu'));
      expect(button.nativeElement.getAttribute('aria-haspopup')).toBe('true');
    });

    it('should have alt text on avatar image', () => {
      fixture.componentRef.setInput('name', 'John Doe');
      fixture.componentRef.setInput('email', 'john@example.com');
      fixture.componentRef.setInput('avatarUrl', 'https://example.com/avatar.jpg');
      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('.user-menu__avatar-img'));
      expect(img.nativeElement.alt).toBe('John Doe');
    });
  });
});
