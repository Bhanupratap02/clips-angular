import { Component } from '@angular/core';
import { FormControl, FormGroup,Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import IUser from 'src/app/models/user.model';
import { RegisterValidators } from '../validators/register-validators';
import { EmailTaken } from '../validators/email-taken';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  
  loading = false;
  showAlert = false;
  alertMsg = "Please wait! your account is being created";
  alertColor = "blue";
  constructor(
    private authService:AuthService,
    private emailTaken:EmailTaken
    ){}
 registerForm = new FormGroup({
  name: new FormControl('',[
    Validators.required,
    Validators.minLength(3)
  ]),
  email: new FormControl('',[


    Validators.required,
    Validators.email
  ],[
    this.emailTaken.validate
  ]),
  age: new FormControl<number | null>(null,[
    Validators.required,
    Validators.min(18),
    Validators.max(90),
  ]),
  password: new FormControl('',[
    Validators.required,
    Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)
  ]),
  confirm_password: new FormControl('',[
    Validators.required
  ]),
  phoneNumber: new FormControl('',[
    Validators.required,
    Validators.minLength(10),
    Validators.maxLength(10)
  ]),
 },[
  RegisterValidators.match('password','confirm_password')
 ])
   async register(){
      this.loading = true;
      this.alertMsg = "Please wait! your account is being created";
      this.alertColor = "blue";
      this.showAlert = true;
    try {
       await  this.authService.createUser(this.registerForm.value as IUser)
    } catch (error) {
      console.error(error);
      this.alertMsg = "An unexpected error occured. Please try again later";
      this.alertColor = 'red';
      this.loading = false;
      return
    }
      this.alertMsg = " Success! your account has been created."
      this.alertColor = "green"
      
      // this.loading = false;
   }
}
