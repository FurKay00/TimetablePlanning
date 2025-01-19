import { Injectable } from '@angular/core';
import {ProfileInfo} from '../models/ProfileInfo';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private currentRole: string = "";
  private currentProfile: ProfileInfo = {
    name: 'John Secretary', role: 'Secretary', imgUrl: '/images/secretary_image.png', classes: ['Class 1', 'Class 2', 'Class N'], faculty: 'Technology'
  };

  constructor() { }

  setRole(role:string): void{
    this.currentRole = role;
  }

  getUserRole(): string {
    return this.currentRole;
  }

  hasRole(role:string): boolean{
    return this.currentRole === role;
  }

  getSecretaryClasses():any[]{
      return this.currentProfile.classes.map( (classItem) => ({id: classItem, label: classItem, icon: 'groups' , path: '/secretary-schedule/' + classItem }));
  }
}
