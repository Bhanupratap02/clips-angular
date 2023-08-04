import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import IUser from '../models/user.model';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { Observable, delay, filter, map, of, switchMap } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
 private usersCollection: AngularFirestoreCollection<IUser>
 public isAuthenticated$:Observable<boolean>
 public isAuthenticatedWithDelay$:Observable<boolean>
 private redirect = false
 constructor(
   private auth: AngularFireAuth,
    private db: AngularFirestore,
    private router:Router,
     private route:ActivatedRoute
    ){
        this.usersCollection = this.db.collection('users')
        this.isAuthenticated$ = auth.user.pipe(
          map((user) =>!!user)
        )
        this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(
          delay(1000)
        )
       this.router.events.pipe(
        filter(e => e instanceof NavigationEnd),
        map( e => this.route.firstChild ),
        switchMap(route => route?.data ?? of({authOnly:false}))
       ).subscribe(data => {  
              // console.log(data.authOnly);
             this.redirect = data?.authOnly ?? false; 
        
       })
       

       
    }
  public async createUser(userData:IUser){
    if(!userData.password){
      throw new Error("Password not provided");
    }
   const usercred = await this.auth.createUserWithEmailAndPassword(
        userData.email as string, userData.password as string);
        console.log(usercred);
        if(!usercred.user){
 throw new Error("User canot be found");
        }
       await  this.usersCollection.doc(usercred.user?.uid).set({ name:userData.name,email:userData.email,age:userData.age,phoneNumber:userData.phoneNumber})
      await  usercred.user.updateProfile({
        displayName:userData.name
       })
  }
  public   async logout($event?:Event){
    if($event){
   $event.preventDefault();
    }
   await this.auth.signOut();
   if(this.redirect){
   await this.router.navigateByUrl('/')
   }

  }
}
