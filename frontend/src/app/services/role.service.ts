import { Injectable } from '@angular/core';
import {ProfileInfo} from '../models/ProfileInfo';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private currentRole: string = "";
  private currentProfile: ProfileInfo = {
    id: "3", name: 'John Secretary', role: 'Secretary', imgUrl: '/images/secretary_image.png', classes: ['Class 1', 'Class 2', 'Class N'], faculty: 'Technology'
  };

  constructor() { }

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

  getClass():string{
    return this.currentProfile.class || "";
  }
  getSecretaryClasses():any[]{
      return this.currentProfile.classes.map( (classItem) => ({id: classItem, label: classItem, icon: 'groups' , path: '/secretary-schedule/' + classItem }));
  }

  getDynamicHeader() {
    if(this.currentRole === 'Secretary'){
      return "Classes from faculty " + this.currentProfile.faculty;
    }else {
      return "Schedule from " + this.currentProfile.name
    }
  }
}
