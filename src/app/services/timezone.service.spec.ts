import { TestBed } from '@angular/core/testing';
import { TimezoneService } from './timezone.service';
import { DateTime } from 'luxon';

describe('TimezoneService - Overnight Availability', () => {
  let service: TimezoneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimezoneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Overnight Shift Validation', () => {
    const overnightAvailability = [
      {
        day: 'Monday',
        startTime: '12:45', // 12:45 PM
        endTime: '05:30'    // 5:30 AM next day
      }
    ];

    const normalAvailability = [
      {
        day: 'Monday',
        startTime: '09:00', // 9:00 AM
        endTime: '17:00'    // 5:00 PM
      }
    ];

    it('should validate appointment within overnight shift - late Monday', () => {
      // Monday 11:00 PM (within Monday 12:45 PM - Tuesday 5:30 AM)
      const appointmentTime = DateTime.fromObject({
        year: 2024,
        month: 12,
        day: 23, // Monday
        hour: 23,
        minute: 0
      }, { zone: 'Asia/Kolkata' });

      const result = service.isTimeWithinAvailability(appointmentTime, overnightAvailability);
      expect(result).toBe(true);
    });

    it('should validate appointment within overnight shift - early Tuesday', () => {
      // Tuesday 4:30 AM (within Monday 12:45 PM - Tuesday 5:30 AM)
      const appointmentTime = DateTime.fromObject({
        year: 2024,
        month: 12,
        day: 24, // Tuesday
        hour: 4,
        minute: 30
      }, { zone: 'Asia/Kolkata' });

      const result = service.isTimeWithinAvailability(appointmentTime, overnightAvailability);
      expect(result).toBe(true);
    });

    it('should reject appointment outside overnight shift - early Monday', () => {
      // Monday 10:00 AM (before Monday 12:45 PM start)
      const appointmentTime = DateTime.fromObject({
        year: 2024,
        month: 12,
        day: 23, // Monday
        hour: 10,
        minute: 0
      }, { zone: 'Asia/Kolkata' });

      const result = service.isTimeWithinAvailability(appointmentTime, overnightAvailability);
      expect(result).toBe(false);
    });

    it('should reject appointment outside overnight shift - late Tuesday', () => {
      // Tuesday 6:00 AM (after Tuesday 5:30 AM end)
      const appointmentTime = DateTime.fromObject({
        year: 2024,
        month: 12,
        day: 24, // Tuesday
        hour: 6,
        minute: 0
      }, { zone: 'Asia/Kolkata' });

      const result = service.isTimeWithinAvailability(appointmentTime, overnightAvailability);
      expect(result).toBe(false);
    });

    it('should handle normal day shift correctly', () => {
      // Monday 2:00 PM (within Monday 9:00 AM - 5:00 PM)
      const appointmentTime = DateTime.fromObject({
        year: 2024,
        month: 12,
        day: 23, // Monday
        hour: 14,
        minute: 0
      }, { zone: 'Asia/Kolkata' });

      const result = service.isTimeWithinAvailability(appointmentTime, normalAvailability);
      expect(result).toBe(true);
    });

    it('should handle edge case - exactly at start time', () => {
      // Monday 12:45 PM (exactly at start time)
      const appointmentTime = DateTime.fromObject({
        year: 2024,
        month: 12,
        day: 23, // Monday
        hour: 12,
        minute: 45
      }, { zone: 'Asia/Kolkata' });

      const result = service.isTimeWithinAvailability(appointmentTime, overnightAvailability);
      expect(result).toBe(true);
    });

    it('should handle edge case - exactly at end time', () => {
      // Tuesday 5:30 AM (exactly at end time)
      const appointmentTime = DateTime.fromObject({
        year: 2024,
        month: 12,
        day: 24, // Tuesday
        hour: 5,
        minute: 30
      }, { zone: 'Asia/Kolkata' });

      const result = service.isTimeWithinAvailability(appointmentTime, overnightAvailability);
      expect(result).toBe(true);
    });

    it('should handle midnight correctly', () => {
      // Tuesday 12:00 AM (midnight, within overnight shift)
      const appointmentTime = DateTime.fromObject({
        year: 2024,
        month: 12,
        day: 24, // Tuesday
        hour: 0,
        minute: 0
      }, { zone: 'Asia/Kolkata' });

      const result = service.isTimeWithinAvailability(appointmentTime, overnightAvailability);
      expect(result).toBe(true);
    });
  });

  describe('Availability Display Formatting', () => {
    it('should format overnight availability correctly', () => {
      const overnightAvailability = [
        {
          day: 'Monday',
          startTime: '12:45',
          endTime: '05:30'
        }
      ];

      const result = service.formatAvailabilityForDisplay(overnightAvailability);
      expect(result).toContain('(next day)');
      expect(result).toContain('12:45 PM');
      expect(result).toContain('5:30 AM');
    });

    it('should format normal availability correctly', () => {
      const normalAvailability = [
        {
          day: 'Monday',
          startTime: '09:00',
          endTime: '17:00'
        }
      ];

      const result = service.formatAvailabilityForDisplay(normalAvailability);
      expect(result).not.toContain('(next day)');
      expect(result).toContain('9:00 AM');
      expect(result).toContain('5:00 PM');
    });
  });
});
