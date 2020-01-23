import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { StudentsService } from '../services/students.service';
import { ApiService } from 'src/app/shared/services/api.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseInterface } from '../interfaces/response-interface';


@Component({
  selector: 'app-students-modal-window',
  templateUrl: './students-modal-window.component.html',
  styleUrls: ['./students-modal-window.component.scss']
})
export class StudentsModalWindowComponent implements OnInit {

  private username: string;
  private email: string;

  public studentForm = new FormGroup({
    lastname: new FormControl(
      this.data.student_data ? this.data.student_data.student_surname : '',
      Validators.required),
    firstname: new FormControl(
      this.data.student_data ? this.data.student_data.student_name : '',
      Validators.required),
    fathername: new FormControl(
      this.data.student_data ? this.data.student_data.student_fname : '',
      Validators.required),
    gradebookID: new FormControl(
      this.data.student_data ? this.data.student_data.gradebook_id : '', 
      Validators.required,
      this.uniqueValidator('gradebookID', 'checkGradebookID')),
    login: new FormControl('', 
      Validators.required,
      this.uniqueValidator('login', 'checkUsername')),
    email: new FormControl('', 
      [
        Validators.required, 
        Validators.email,
      ], 
      this.uniqueValidator('email', 'checkUserEmail')),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    password_confirm: new FormControl(''),
  });

  public response: Object;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private studentsHttpService: StudentsService,
    private apiService: ApiService,
    public dialogRef: MatDialogRef<StudentsModalWindowComponent>,
  ) { }

  ngOnInit() {
    this.getUserData();
    this.setUserValues();
    this.studentForm.setValidators(this.comparisonValidator());
  }

  handleSubmit(value: any) {
    const studentDATA = {
        gradebook_id: value.gradebookID,
        student_surname: value.lastname,
        student_name: value.firstname,
        student_fname: value.fathername,
        group_id: this.data.group_id,
        password: value.password,
        username: value.login,
        email: value.email,
        photo: '',
        password_confirm: value.password_confirm,
        plain_password: value.password
    };
    if (this.data.updateStudent == true) {
        this.apiService.updEntity('Student', studentDATA, this.data.student_data.user_id).subscribe(
          (data: ResponseInterface) => this.dialogRef.close(data),
          error => this.dialogRef.close(error)
      );
      return;
    } else {
        this.apiService.createEntity('Student', studentDATA).subscribe(
          (data) => this.dialogRef.close(data),
          error => this.dialogRef.close(error)
    );
    }
  }
  
  closeModalWindow() {
    this.dialogRef.close('Canceled');
  }

  comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      const control1 = group.get('password');
      const control2 = group.get('password_confirm');
      if (control1.value !== control2.value) {
        control2.setErrors({ notEquivalent: true });
      } else {
        control2.setErrors(null);
     }
      return;
    };
  }

  uniqueValidator(prop, method) {
    return (control: FormControl) => {
      if(!this.data.student_data){
        console.log(this.data.student_data);
        return this.studentsHttpService[method](control.value)
          .pipe(
            map((result: any) => {
              return result.response ? { propertyIsNotUnique: true } : null;
            })
          );
      } else if(prop === 'gradebookID' && this.data.student_data.gradebook_id === control.value){
            console.log(control.value);  return of(null);
      } else if(prop === 'login' && this.username === control.value){
        console.log(control.value); return of(null);
      } else   if(prop === 'email' && this.email === control.value){
        console.log(control.value); return of(null);
      }
    }
  };

  getUserData(){
    if(this.data.student_data){
      this.apiService.getEntity('AdminUser', this.data.student_data.user_id).subscribe((result: any) =>{
        this.username = result[0].username;
        this.email = result[0].email;
      });
    }
  }

  setUserValues(){
    if(this.data.student_data){
      this.apiService.getEntity('AdminUser', this.data.student_data.user_id).subscribe((result: any) =>{
        this.studentForm.get('login').setValue(result[0].username, { onlySelf: true });
        this.studentForm.get('email').setValue(result[0].email, { onlySelf: true });
      });
    }
  }
}