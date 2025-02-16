import { Injectable } from '@angular/core';
import {ProfileInfo} from '../models/ProfileInfo';
import {map} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  URL: string = "http://127.0.0.1:8000/accounts/"
  currentAccounts: ProfileInfo[] = []
  private currentRole: string = "";
  private currentProfile: ProfileInfo = {
    id: "3", fullname: 'John Secretary', role: 'SECRETARY', imgUrl: '/images/secretary_image.png', classes: ['Class 1', 'Class 2', 'Class N'], faculty: 'Technology'
  };

  constructor(private http:HttpClient) {
    this.retrieveAllAccounts();
  }

  setCurrentProfile(currentProfile:ProfileInfo){
    this.currentProfile = currentProfile;
  }
  setRole(role:string): void{
    this.currentRole = role;
  }

  getUserRole(): string {
    return this.currentRole;
  }

  getId(){
    return this.currentProfile.id;
  }

  getUsername(){
    return this.currentProfile.fullname;
  }
  getClass():string{
    return this.currentProfile.class_id || "";
  }
  getSecretaryClasses():any[]{
      return this.currentProfile.classes?.map( (classItem) => ({id: classItem, label: classItem, icon: 'groups' , path: '/secretary-schedule/' + classItem })) ||  [];
  }

  getDynamicHeader() {
    if(this.currentRole === 'SECRETARY'){
      return "Classes from faculty " + this.currentProfile.faculty;
    }else {
      return "Schedule from " + this.currentProfile.fullname
    }
  }

  retrieveAllAccounts() {
    return this.http.get<{
      message: string;
      accounts: ProfileInfo[]
    }>(this.URL + "all/")
      .pipe(
        map(response => this.currentAccounts=response.accounts
        )
      );
  }

  getAllAccounts():ProfileInfo[]{
    return this.currentAccounts;
  }
}
