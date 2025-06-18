import { Component, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signInWithCredential, signOut, User } from '@angular/fire/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private auth = inject(Auth);
  user: User | null = null;

  constructor() {
    this.auth.onAuthStateChanged((u) => (this.user = u));
  }

  async loginWithGoogle() {
    const isNative = Capacitor.isNativePlatform();
    console.log("isnative", isNative)

    if (isNative) {
      console.log("using native start")
      const result = await FirebaseAuthentication.signInWithGoogle();
      console.log("using native result", result)
      const credential = GoogleAuthProvider.credential(result.credential?.idToken);
      console.log("using native credential", credential)
      const userCred = await signInWithCredential(this.auth, credential);
      console.log("using native userCred", userCred)
      this.user = userCred.user;
    } else {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      this.user = result.user;
    }
  }

  async logout() {
    await FirebaseAuthentication.signOut(); // no-op on web
    await signOut(this.auth);
    this.user = null;
  }
}
