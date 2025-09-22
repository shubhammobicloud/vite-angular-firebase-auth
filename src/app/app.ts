import { Component, inject, ChangeDetectorRef } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signOut,
  User,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from '@angular/fire/firestore'; // ✅ Firestore imports
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private auth = inject(Auth);
  private firestore = inject(Firestore); // ✅ Firestore instead of Database
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);
  user: User | null = null;
  name: string = '';

  ngOnInit() {
    this.auth.onAuthStateChanged((u) => {
      this.user = u;
      console.log('User is', u ? 'logged in' : 'not logged in');
      this.cdr.detectChanges();
    });
  }

  async loginWithGoogle() {
    const isNative = Capacitor.isNativePlatform();
    console.log('isnative', isNative);

    if (isNative) {
      const result = await FirebaseAuthentication.signInWithGoogle();
      const credential = GoogleAuthProvider.credential(
        result.credential?.idToken
      );
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

  async setKey(data: any) {
    // try {
    //   // Reference to a specific document (collection 'users', doc ID 'testKey')
    //   const docRef = doc(this.firestore, 'users/testKey');

    //   // Create/overwrite the document
    //   await setDoc(docRef, {
    //     name: 'Shubham',
    //     email: this.user?.email || 'guest@example.com',
    //     createdAt: Date.now(),
    //   });

    //   console.log('Firestore document set successfully');
    // } catch (error) {
    //   console.error('Error setting Firestore document:', error);
    // }

    try {
      // ✅ Add a new doc with a random ID
      // const docRef = await addDoc(collection(this.firestore, 'users'), {
      //   name: 'Shubham',
      //   email: this.user?.email || 'guest@example.com',
      //   createdAt: Date.now(),
      // });
      const docRef = await addDoc(collection(this.firestore, 'users'), data);

      console.log('Document written with random ID:', docRef.id);
    } catch (error) {
      console.error('Error adding document:', error);
    }
  }

  async getKey() {
    try {
      const docRef = doc(this.firestore, 'users/testKey');
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        console.log('Fetched Firestore data:', data);
        return data; // You can assign this to a variable/property if needed
      } else {
        console.log('No such document!');
        return null;
      }
    } catch (error) {
      console.error('Error getting Firestore document:', error);
      return null;
    }
  }

  async findAllWithName(name: string) {
    try {
      // Reference the 'users' collection and add a where filter
      const q = query(
        collection(this.firestore, 'users'),
        where('Pincode', '==', name)
      );

      // Execute the query
      const snapshot = await getDocs(q);

      // Map each document into a plain object
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log('Users with name "Shubham":', users);
      return users;
    } catch (error) {
      console.error('Error fetching users with name Shubham:', error);
      return [];
    }
  }

  async find() {
    console.log(this.name);
    const users = await this.findAllWithName(this.name);
    console.log("users", users);
    this.http
      .get(`https://api.postalpincode.in/pincode/${this.name}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          console.log(data[0].PostOffice);

          data[0].PostOffice.forEach((postOffice: any) => {
            console.log(postOffice.Name);
            this.setKey(postOffice);
          });
        },
        error: (error) => {
          console.error(error);
        },
      });
  }
}
