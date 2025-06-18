import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signInWithCredential, signOut, User } from '@angular/fire/auth';
import { Database } from '@angular/fire/database';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private auth = inject(Auth);
   private database = inject(Database);
  private cdr = inject(ChangeDetectorRef);
  user: User | null = null;

  ngOnInit() {
    this.auth.onAuthStateChanged((u) => {
      this.user = u;
      console.log('User is', u ? 'logged in' : 'not logged in');
      this.cdr.detectChanges();
    });
  }

  async loginWithGoogle() {
    const isNative = Capacitor.isNativePlatform();
    console.log("isnative", isNative)

    if (isNative) {
      const result = await FirebaseAuthentication.signInWithGoogle();
      const credential = GoogleAuthProvider.credential(result.credential?.idToken);
      const userCred = await signInWithCredential(this.auth, credential);
      this.user = userCred.user;
    } else {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      this.user = result.user;
    }

    this.cdr.detectChanges();
  }

  async logout() {
    await FirebaseAuthentication.signOut(); // no-op on web
    await signOut(this.auth);
    this.user = null;
    this.cdr.detectChanges();
  }
}
