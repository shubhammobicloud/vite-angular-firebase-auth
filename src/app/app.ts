import { Component, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private auth = inject(Auth);
  user: any = null;

  constructor() {
    this.auth.onAuthStateChanged((user) => {
      this.user = user;
      console.log("user", this.user);
    });
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      this.user = result.user;
      console.log('User signed in:', this.user);
    } catch (error) {
      console.error('Login failed', error);
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.user = null;
      console.log('User signed out');
    } catch (error) {
      console.error('Logout failed', error);
    }
  }

}
