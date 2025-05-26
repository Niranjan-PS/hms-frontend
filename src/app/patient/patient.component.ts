import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule
  ],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.css'
})
export class PatientComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    // This is just a layout container component
    // All data loading is handled by child components
  }
}
