import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ProfileInfo} from '../../../models/ProfileInfo';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-profile-drop-down',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './profile-drop-down.component.html',
  styleUrl: './profile-drop-down.component.css'
})
export class ProfileDropDownComponent {
  @Input() profiles: ProfileInfo[] | null = null;
  selectedProfile: ProfileInfo | null = null;
  @Output() profileSelected = new EventEmitter<ProfileInfo>();

  onProfileSelect(profile: ProfileInfo): void {
    this.profileSelected.emit(profile);
    this.selectedProfile = profile;
  }
}
