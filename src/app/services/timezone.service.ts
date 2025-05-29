import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';

@Injectable({
  providedIn: 'root'
})
export class TimezoneService {
  private readonly IST_TIMEZONE = 'Asia/Kolkata';

  constructor() { }

  
  createISTDateTime(date: string, time: string): DateTime {
    const dateTimeString = `${date}T${time}:00`;
    return DateTime.fromISO(dateTimeString, { zone: this.IST_TIMEZONE });
  }

 
  convertISTToUTC(istDateTime: DateTime): string {
    return istDateTime.toUTC().toISO() || '';
  }

  
  convertUTCToIST(utcDateTimeString: string): DateTime {
    return DateTime.fromISO(utcDateTimeString).setZone(this.IST_TIMEZONE);
  }

 
  formatTimeToAMPM(dateTime: DateTime): string {
    return dateTime.toFormat('h:mm a');
  }

  
  formatDateTimeToDisplay(dateTime: DateTime): string {
    return dateTime.toFormat('MMM dd, yyyy \'at\' h:mm a');
  }

  isTimeWithinAvailability(appointmentTime: DateTime, availability: any[]): boolean {
    const dayName = appointmentTime.toFormat('cccc'); 

    const currentDayAvailability = availability.find(slot =>
      slot.day.toLowerCase() === dayName.toLowerCase()
    );

    
    const previousDay = appointmentTime.minus({ days: 1 }).toFormat('cccc');
    const previousDayAvailability = availability.find(slot =>
      slot.day.toLowerCase() === previousDay.toLowerCase()
    );

    
    if (currentDayAvailability && this.isWithinTimeRange(appointmentTime, currentDayAvailability)) {
      return true;
    }

    
    if (previousDayAvailability && this.isWithinOvernightRange(appointmentTime, previousDayAvailability)) {
      return true;
    }

    return false;
  }

 
  private isWithinTimeRange(appointmentTime: DateTime, availability: any): boolean {
    const appointmentTimeOnly = appointmentTime.toFormat('HH:mm');
    const startTime = availability.startTime;
    const endTime = availability.endTime;

   
    if (startTime <= endTime) {
      return appointmentTimeOnly >= startTime && appointmentTimeOnly <= endTime;
    }

    
    return appointmentTimeOnly >= startTime;
  }

  
  private isWithinOvernightRange(appointmentTime: DateTime, previousDayAvailability: any): boolean {
    const appointmentTimeOnly = appointmentTime.toFormat('HH:mm');
    const startTime = previousDayAvailability.startTime;
    const endTime = previousDayAvailability.endTime;

    
    if (startTime > endTime) {
      return appointmentTimeOnly <= endTime;
    }

    return false;
  }

 
  getCurrentISTTime(): DateTime {
    return DateTime.now().setZone(this.IST_TIMEZONE);
  }

  
  isAppointmentInFuture(appointmentTime: DateTime): boolean {
    const now = this.getCurrentISTTime();
    return appointmentTime > now;
  }

 
  formatAvailabilityForDisplay(availability: any[]): string {
    if (!availability || availability.length === 0) {
      return 'No availability set';
    }

    const formattedSlots = availability.map(slot => {
      const startTime = DateTime.fromFormat(slot.startTime, 'HH:mm').toFormat('h:mm a');
      const endTime = DateTime.fromFormat(slot.endTime, 'HH:mm').toFormat('h:mm a');

      
      if (slot.startTime > slot.endTime) {
        return `${slot.day}: ${startTime} – ${endTime} (next day)`;
      } else {
        return `${slot.day}: ${startTime} – ${endTime}`;
      }
    });

    return formattedSlots.join(', ');
  }

 
  convertDatetimeLocalToIST(datetimeLocalValue: string): DateTime {
   
    const localDateTime = DateTime.fromISO(datetimeLocalValue);

    
    return DateTime.fromObject({
      year: localDateTime.year,
      month: localDateTime.month,
      day: localDateTime.day,
      hour: localDateTime.hour,
      minute: localDateTime.minute
    }, { zone: this.IST_TIMEZONE });
  }

  
  convertISTToDatetimeLocal(istDateTime: DateTime): string {
    return istDateTime.toFormat("yyyy-MM-dd'T'HH:mm");
  }

 
  getMinDatetimeLocal(): string {
    const now = this.getCurrentISTTime();
    return this.convertISTToDatetimeLocal(now);
  }

 
  getAvailabilityDetails(appointmentTime: DateTime, availability: any[]): {
    isAvailable: boolean;
    matchingSlots: any[];
    suggestedTimes: string[];
  } {
    const dayName = appointmentTime.toFormat('cccc');
    const previousDay = appointmentTime.minus({ days: 1 }).toFormat('cccc');

    const matchingSlots: any[] = [];

    
    const currentDaySlot = availability.find(slot =>
      slot.day.toLowerCase() === dayName.toLowerCase()
    );

    if (currentDaySlot) {
      matchingSlots.push({
        ...currentDaySlot,
        type: 'current-day'
      });
    }

    
    const previousDaySlot = availability.find(slot =>
      slot.day.toLowerCase() === previousDay.toLowerCase()
    );

    if (previousDaySlot && previousDaySlot.startTime > previousDaySlot.endTime) {
      matchingSlots.push({
        ...previousDaySlot,
        type: 'overnight-from-previous'
      });
    }

    const isAvailable = this.isTimeWithinAvailability(appointmentTime, availability);

 
    const suggestedTimes = availability
      .filter(slot => slot.day.toLowerCase() === dayName.toLowerCase() ||
                     (slot.startTime > slot.endTime && slot.day.toLowerCase() === previousDay.toLowerCase()))
      .map(slot => {
        if (slot.startTime > slot.endTime) {
          return `${slot.day}: ${DateTime.fromFormat(slot.startTime, 'HH:mm').toFormat('h:mm a')} – ${DateTime.fromFormat(slot.endTime, 'HH:mm').toFormat('h:mm a')} (next day)`;
        } else {
          return `${slot.day}: ${DateTime.fromFormat(slot.startTime, 'HH:mm').toFormat('h:mm a')} – ${DateTime.fromFormat(slot.endTime, 'HH:mm').toFormat('h:mm a')}`;
        }
      });

    return {
      isAvailable,
      matchingSlots,
      suggestedTimes
    };
  }
}
