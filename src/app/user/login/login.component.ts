import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(
    private auth:AngularFireAuth  ){

  }
 credentials = {
  email:"",
  password:""
 }
 showAlert = false;
 alertMsg = "Please wait! we are logging you in.";
 alertColor ="blue";
 inSubmission = false;

 emailRegx = "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?";

 async login(){
 this.showAlert = true;
 this.alertMsg = "Please wait! we are logging you in.";
 this.alertColor ="blue";
 this.inSubmission = true;
  try {
   await  this.auth.signInWithEmailAndPassword(this.credentials.email,this.credentials.password);
  } catch (error) {
    console.log(error);
    this.inSubmission = false;
    this.alertMsg = "An unexpected error occured.Please try again";
    this.alertColor = "red";
    return;
  }
    this.alertMsg = "Success ! you are logged in.";
    this.alertColor = "green";
 }
}
