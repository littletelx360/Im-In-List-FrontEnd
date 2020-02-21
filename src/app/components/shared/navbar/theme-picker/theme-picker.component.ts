import { Component, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/shared/services/theme.service';
import { ITheme } from './ITheme.interface';

@Component({
  selector: 'app-theme-picker',
  templateUrl: './theme-picker.component.html',
  styleUrls: ['./theme-picker.component.scss']
})
export class ThemePickerComponent implements OnInit {
  currentTheme: number;
  themes: Array<ITheme>;

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
    // theme initialization
    this.themes = [
      { primary: '#673ab7', id: 0 }, // default
      { primary: '#1a1717', id: 1 }, // dark theme
      { primary: '#e91e63', id: 2 }, // red theme
      { primary: '#3f51b5', id: 3 }, // blue theme
    ];

    if (this.themeService.getActualTheme() !== null) {
      this.currentTheme = this.themeService.getActualTheme();
      this.onInstallTheme(this.currentTheme);
    } else {
      this.currentTheme = 0;
    }
  }

  /**
   * Summary: it receives an id of a theme and installs it. It also saves the id of the theme
   * in the local storage
   * 
   *
   * @param id the id of the theme.
   */
  onInstallTheme(id: number) {
    this.themeService.saveTheme(id);
    this.currentTheme = id;
    switch (id) {
      case 0: // default theme
        document.body.className = '';
        break;
      case 1: // dark theme
        document.body.className = 'iminlist-dark-theme';
        break;
      case 2: // red theme
        document.body.className = 'iminlist-red-theme';
        break;
      case 3: // blue theme
        document.body.className = 'iminlist-blue-theme';
        break;
      default: // default theme
        document.body.className = '';
        break;
    }
  }
}
