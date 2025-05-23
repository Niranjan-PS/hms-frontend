import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPatientManagementComponent } from './admin-patient-management-component.component';

describe('AdminPatientManagementComponentComponent', () => {
  let component: AdminPatientManagementComponent;
  let fixture: ComponentFixture<AdminPatientManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPatientManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPatientManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
